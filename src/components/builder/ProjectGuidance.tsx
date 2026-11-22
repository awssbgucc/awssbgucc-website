export function ProjectGuidance() {
  return (
    <aside className="text-sm text-text-muted">
      <p className="type-label text-text-muted">What reviewers look for</p>
      <ul className="mt-3 flex flex-col gap-3">
        <li>The project runs, or the repository includes clear instructions to run it.</li>
        <li>Include a screenshot or architecture diagram so visitors can see how it works.</li>
        <li>Submit your own work, and only credit teammates who agreed to be named.</li>
        <li>Remove all secrets from your repository, including AWS keys, passwords and tokens.</li>
      </ul>
    </aside>
  );
}
