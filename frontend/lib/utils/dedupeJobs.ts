interface DedupableJob {
    _id: string;
    title: string;
    company: string;
    createdAt: string;
}

// Job boards often post the exact same role at the same company across many
// cities/offices (e.g. "Staff Engineer, Product (Berlin)" / "(São Paulo)" /
// ...) -- each is a genuinely distinct posting (own _id, own apply link),
// but a user scanning the list sees what looks like the same job repeated.
// Keying on company + title with any trailing "(...)"/"[...]" qualifier
// stripped collapses those to one card, and also catches the simpler case
// of the same exact posting being fetched twice because it matched more
// than one of the user's target roles.
function dedupeKey(job: DedupableJob): string {
    const baseTitle = job.title
        .replace(/\s*[([][^)\]]*[)\]]\s*$/, "")
        .trim()
        .toLowerCase();
    return `${job.company.trim().toLowerCase()}::${baseTitle}`;
}

export function dedupeJobListings<T extends DedupableJob>(jobs: T[], limit: number): T[] {
    const sorted = [...jobs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const seen = new Set<string>();
    const result: T[] = [];

    for (const job of sorted) {
        const key = dedupeKey(job);
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(job);
        if (result.length >= limit) break;
    }

    return result;
}
