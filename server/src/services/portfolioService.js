const toProject = (r) => ({
  id: r.id,
  title: r.title,
  summary: r.summary,
  highlights: JSON.parse(r.highlights),
  tech: JSON.parse(r.tech),
  tags: JSON.parse(r.tags),
  period: r.period,
  repoUrl: r.repo_url,
  featured: r.featured === 1,
});

export function createPortfolioService(db) {
  const allProjects = db.prepare('SELECT * FROM projects ORDER BY sort_order');
  const oneProject = db.prepare('SELECT * FROM projects WHERE id = ?');
  const allSkills = db.prepare('SELECT category, items FROM skills ORDER BY sort_order');
  const allExperience = db.prepare('SELECT * FROM experience ORDER BY sort_order');

  return {
    async listProjects(tag) {
      const rows = allProjects.all().map(toProject);
      return tag ? rows.filter((p) => p.tags.includes(tag)) : rows;
    },
    async getProject(id) {
      const row = oneProject.get(id);
      return row ? toProject(row) : null;
    },
    async listSkills() {
      return allSkills.all().map((r) => ({ category: r.category, items: JSON.parse(r.items) }));
    },
    async listExperience() {
      return allExperience.all().map((r) => ({
        id: r.id,
        role: r.role,
        company: r.company,
        location: r.location,
        period: r.period,
        highlights: JSON.parse(r.highlights),
      }));
    },
  };
}
