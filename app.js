(function () {
  const data = window.RESUME_DATA;

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const bulletList = (items) => `
    <ul class="bullet-list">
      ${items.map((item) => `<li>${esc(item)}</li>`).join("")}
    </ul>`;

  const entry = ({ title, period, subtitle, bullets }, className = "entry") => `
    <article class="${className}">
      <div class="entry-heading">
        <h3>${esc(title)}</h3>
        <time>${esc(period)}</time>
      </div>
      ${subtitle ? `<p class="entry-subtitle">${esc(subtitle)}</p>` : ""}
      ${bulletList(bullets)}
    </article>`;

  const section = (title, content) => `
    <section class="resume-section">
      <h2 class="section-title">${esc(title)}</h2>
      ${content}
    </section>`;

  const experienceHtml = data.experience.map((item) => entry({
    title: item.company,
    period: item.period,
    subtitle: item.subtitle,
    bullets: item.bullets
  }, "entry experience-entry")).join("");

  const projectsHtml = data.projects.map((item) => entry({
    title: item.name,
    period: item.period,
    subtitle: item.subtitle,
    bullets: item.bullets
  }, "entry project-entry")).join("");

  const educationHtml = data.education.map((item) => entry({
    title: `${item.school} ｜ ${item.degree}`,
    period: item.period,
    subtitle: "",
    bullets: item.bullets
  }, "entry education-entry")).join("");

  document.querySelector("#resume").innerHTML = `
    <section class="resume-page page-one" aria-label="简历第1页">
      <header class="profile-header">
        <div class="profile-main">
          <h1>${esc(data.profile.name)}</h1>
          <p class="contact-line">
            <span>${esc(data.profile.gender)}</span>
            <span>${esc(data.profile.phone)}</span>
            <span>${esc(data.profile.email)}</span>
          </p>
          <p class="status-line">
            <span>${esc(data.profile.status)}</span>
            <span>${esc(data.profile.targetRole)}</span>
          </p>
        </div>
        <img class="profile-photo" src="${esc(data.profile.avatar)}" alt="个人证件照" />
      </header>

      ${section("个人总结", bulletList(data.summary))}
      ${section("工作经历", experienceHtml)}
    </section>

    <section class="resume-page page-two" aria-label="简历第2页">
      ${section("项目经历", projectsHtml)}
      ${section("教育经历", educationHtml)}
    </section>`;

  document.querySelector("#printButton").addEventListener("click", () => window.print());
})();
