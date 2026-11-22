# Deploy

How the site's AWS resources are set up. Phase 7 adds the Amplify Hosting steps.

## Uploads bucket

Images uploaded in the dashboard go to one Amazon S3 bucket. The browser sends each file straight to S3 with a presigned PUT, so the server never handles the bytes.

| Setting | Value |
|---|---|
| Bucket | `sbg-ucc-uploads` |
| Region | `eu-west-1` (Ireland). `af-south-1` is an opt-in region and costs more. |
| Object ownership | Bucket owner enforced (ACLs off) |
| Encryption | SSE-S3, the default |
| Public read | Through the bucket policy below, for the four upload folders only |
| Tag | `project=sbg-ucc` |

Environment variables, locally and on Amplify:

```
S3_BUCKET=sbg-ucc-uploads
S3_REGION=eu-west-1
S3_PUBLIC_BASE_URL=https://sbg-ucc-uploads.s3.eu-west-1.amazonaws.com
```

`next.config.ts` reads `S3_PUBLIC_BASE_URL` to allow the bucket in `next/image`, so Amplify needs it at build time as well as at run time.

### Block Public Access

Objects are public to read, because `next/image` fetches them by URL. ACLs stay blocked; only the bucket policy grants access.

```
BlockPublicAcls=true
IgnorePublicAcls=true
BlockPublicPolicy=false
RestrictPublicBuckets=false
```

### Bucket policy

Anyone may read files in the five upload folders. Nothing else in the bucket is public, and listing is never allowed.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadUploads",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::sbg-ucc-uploads/events/*",
        "arn:aws:s3:::sbg-ucc-uploads/team/*",
        "arn:aws:s3:::sbg-ucc-uploads/partners/*",
        "arn:aws:s3:::sbg-ucc-uploads/posts/*",
        "arn:aws:s3:::sbg-ucc-uploads/projects/*"
      ]
    }
  ]
}
```

### CORS

The browser PUTs to S3 from the dashboard, so the bucket must allow the site's origin. Add the production origin when the domain is known (Phase 7).

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000"],
      "AllowedMethods": ["PUT"],
      "AllowedHeaders": ["content-type"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### IAM policy for the app

The app can only write and delete files in this one bucket. It cannot read, list or change the bucket's settings. Named `sbg-ucc-uploads`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "UploadsBucketWriteDelete",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::sbg-ucc-uploads/*"
    }
  ]
}
```

## Credentials

No AWS keys are stored in environment variables. Amplify does not allow variable names that start with `AWS`, and the SDK finds credentials by itself.

**Local development.** The IAM user `sbg-ucc-uploads-dev` has only the policy above. Its access key lives in `~/.aws/credentials` under the profile `sbg-ucc`, and `.env` sets `AWS_PROFILE=sbg-ucc`. To set it up on another machine, create a new access key for that user in the IAM console, then run `aws configure --profile sbg-ucc` and choose `eu-west-1`.

**Amplify Hosting (Phase 7).** Create an IAM role that Amplify can assume, attach the `sbg-ucc-uploads` policy, and set it as the app's SSR Compute role under App settings, IAM roles. Trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "amplify.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Check the trust policy against the current AWS page before creating the role: https://docs.aws.amazon.com/amplify/latest/userguide/amplify-SSR-compute-role.html

## Upload rules

The full rules are in docs/ADMIN.md. In short:

- Photos and covers: JPEG, PNG or WebP. Partner logos: PNG or WebP, with a transparent background. No SVG in v1. 5 MB at most.
- Keys: `<folder>/<recordId>/<random>.<ext>`, where the folder is `events`, `team`, `partners`, `posts` or `projects`. Members may upload only to `projects/<id>/` for a project they own; everything else needs an admin.
- The presigned URL signs the content type and exact size, and lasts 5 minutes. S3 refuses any other file sent to it.
- When an image is replaced or removed, or its record is deleted, the old file is deleted.
- A file uploaded and then never saved stays in the bucket. At our size the cost is a fraction of a cent.

## Builder portal (added 5 Nov 2026)

Not done yet, and each needs Joel:

1. **Bucket policy.** The live policy on `sbg-ucc-uploads` still lists four folders. Add `projects/*` as above, or project images will upload but not display. No cost.
2. **Migration on Neon.** `prisma/migrations/20261105090000_add_member_platform` is additive (new tables, new nullable columns, no drops). Run `pnpm db:deploy` against the Neon direct connection, then `pnpm db:seed` to add the default award rules, achievements and digital rewards. The seed is create-only, so it never overwrites edits.
3. **Never run `pnpm db:fixtures` on Neon.** It refuses any database that is not on localhost.
4. **Google OAuth.** Members sign in with the same Google client as admins. If the OAuth consent screen is in testing mode, only listed test users can sign in; publish the consent screen before opening the portal to members.
5. **Data protection.** See the TODO(joel) in `src/app/(site)/privacy/page.tsx` before opening the portal.

### Local development database

Development and tests use a throwaway local Postgres, never Neon. Any PostgreSQL 15+ works. Without Docker, the PGlite socket server that ships in `node_modules` works:

```
node node_modules/.pnpm/@electric-sql+pglite-socket@0.1.3_@electric-sql+pglite@0.4.3/node_modules/@electric-sql/pglite-socket/dist/scripts/server.js --db=<folder> --port=5433 --max-connections=100
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/postgres?sslmode=disable" DIRECT_URL="$DATABASE_URL"
pnpm db:deploy && pnpm db:seed && pnpm db:fixtures
pnpm test:int        # database tests, local only
pnpm test:e2e        # end-to-end tests run only when DATABASE_URL is local
```

Environment variables set in the shell win over `.env` and `.env.local`, so this never touches the Neon branch those files point at.

PGlite runs one transaction at a time, so it cannot show a race. The race tests (`src/lib/platform/races.int.test.ts` and the admin access test) skip there and run only on a real PostgreSQL server: CI runs them on every push, against a service container. To run them on a laptop without Docker, unzip the official binaries (postgresql.org links them, "zip archive of the binaries") into a scratch folder, then:

```
pgsql/bin/initdb -D <folder> -U postgres --auth=trust
pgsql/bin/pg_ctl -D <folder> -o "-p 5434 -c listen_addresses=127.0.0.1" -w start
pgsql/bin/psql -h 127.0.0.1 -p 5434 -U postgres -c "create database sbg_test"
export DATABASE_URL="postgresql://postgres@127.0.0.1:5434/sbg_test" DIRECT_URL="$DATABASE_URL"
pnpm db:deploy && pnpm test:int
```

Two limits of the PGlite server, found on 5 Nov 2026. `next build` opens more than 20 connections at once, and the server closes any connection over the limit, so the build fails with "Connection terminated unexpectedly"; use 100. And a client that drops its connection without closing it (a dev server restarting, or a stopped process) can stop the whole server with an unhandled `ECONNRESET`; start it again with the same folder, and no data is lost. Run one Next server at a time, and Playwright with one worker, on a laptop with little free memory.

## Monitoring (added 22 Nov 2026)

Free tiers only. Nothing here needs a paid service.

What the app does already:

- Every error thrown while rendering a page, running a server action or answering a route writes one JSON line, `{"level":"error","event":"request_error",...}`, from `src/instrumentation.ts`. It has the path without the query string, the route, the kind of request, a short message and the digest, which matches the "Reference" on the dashboard's error page. Next writes several lines for one failed page (one per layout), so treat counts as approximate.
- `health_check_failed` and `s3_delete_failed` lines use the same shape.
- `GET /api/health` answers 200 `{"status":"ok"}` when the app reaches the database, 503 `{"status":"unavailable"}` when it cannot, and nothing more.

What Joel sets up, once, in the AWS and monitor accounts:

1. **Server logs.** Amplify console, App settings, Advanced settings: make sure SSR app logs are on. Logs then appear under Monitoring, Hosting compute logs, as a CloudWatch log group per branch.
2. **5xx alarm.** Amplify console, Monitoring, Alarms: an alarm on `5xxErrors`, Sum, 5 minutes, at 1 or more for 1 period, notifying an SNS topic with the team's email. Confirm the subscription email.
3. **Error alarm from the logs.** CloudWatch, the branch's log group, Metric filters: pattern `{ $.event = "request_error" }`, metric value 1, namespace `sbg-ucc`. Then an alarm on that metric, Sum over 5 minutes, at 1 or more, to the same SNS topic. This catches failures that a page turns into a friendly error, which `5xxErrors` can miss. Add a second filter for `{ $.event = "s3_delete_failed" }` if orphaned uploads matter.
4. **Uptime.** A free external monitor (UptimeRobot or Better Stack): the home page every 5 minutes, and `/api/health` every 60 minutes. Alert by email.

Why `/api/health` is checked only hourly: each call wakes the Neon database, which then stays up for 5 minutes. Neon's free plan allows 100 compute-unit hours a month; a check every 5 minutes would keep the database awake all month (about 180 at 0.25 CU), and Neon suspends the project when the allowance runs out. Hourly costs about 15. The home page is served from the cache and never touches the database, so it can be checked as often as the monitor allows.

CloudWatch alarms and SNS email stay inside the AWS free tier at this size (ten alarms, a few log megabytes a month).
