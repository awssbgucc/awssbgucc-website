export function ProjectGuidance() {
  return (
    <aside className="text-sm text-text-muted">
      <p className="type-label text-text-muted">What reviewers look for</p>
      <ul className="mt-3 flex flex-col gap-3">
        <li>It runs, or the repository shows clearly how to run it.</li>
        <li>A screenshot or architecture diagram, so people can see it.</li>
        <li>Only your own work, or work your teammates agreed to show.</li>
        <li>No secrets in the repository: no keys, passwords or tokens.</li>
      </ul>
    </aside>
  );
}
