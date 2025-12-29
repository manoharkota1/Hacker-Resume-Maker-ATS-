"use client";

import { Resume } from "@/types/resume";

export async function exportToPDF(resume: Resume): Promise<void> {
  const html = generateResumeHTML(resume);

  // Open a new window with the resume content
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) {
    alert("Please allow popups to download PDF");
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for styles and content to load
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };

  // Fallback: trigger print after a short delay if onload doesn't fire
  setTimeout(() => {
    if (printWindow && !printWindow.closed) {
      printWindow.focus();
      printWindow.print();
    }
  }, 500);
}

export async function exportToDOCX(resume: Resume): Promise<void> {
  // Generate HTML and download as .doc (Word can open HTML)
  const html = generateResumeHTML(resume, true);
  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${resume.personal.name.replace(/\s+/g, "_")}_Resume.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateResumeHTML(resume: Resume, forWord = false): string {
  const styles = `
    <style>
      @page { 
        margin: 0.5in; 
        size: letter; 
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Segoe UI', Arial, sans-serif; 
        font-size: 11pt; 
        line-height: 1.4;
        color: #1e293b;
        max-width: 8.5in;
        margin: 0 auto;
        padding: ${forWord ? "0.5in" : "0"};
      }
      h1 { font-size: 24pt; font-weight: 600; margin-bottom: 4px; }
      h2 { 
        font-size: 12pt; 
        font-weight: 600; 
        text-transform: uppercase; 
        letter-spacing: 0.5px;
        border-bottom: 1.5px solid #1e293b; 
        padding-bottom: 4px; 
        margin: 16px 0 10px 0;
      }
      h3 { font-size: 11pt; font-weight: 600; }
      .header { text-align: center; margin-bottom: 12px; }
      .title { font-size: 13pt; color: #475569; margin-bottom: 8px; }
      .contact { font-size: 10pt; color: #64748b; }
      .contact span { margin: 0 6px; }
      .section { margin-bottom: 12px; }
      .item { margin-bottom: 10px; }
      .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
      .item-title { font-weight: 600; }
      .item-subtitle { color: #475569; }
      .item-date { font-size: 10pt; color: #64748b; }
      ul { margin-left: 18px; margin-top: 4px; }
      li { margin-bottom: 3px; }
      .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
      .skill-group { margin-bottom: 4px; }
      .skill-label { font-weight: 600; font-size: 10pt; }
      .skill-items { font-size: 10pt; color: #475569; }
      .summary { margin-bottom: 12px; }
      @media print {
        @page { 
          margin: 0.5in;
        }
        body { padding: 0; }
        h2 { page-break-after: avoid; }
        .item { page-break-inside: avoid; }
      }
    </style>
  `;

  const contactItems = [
    resume.personal.email,
    resume.personal.phone,
    resume.personal.location,
    resume.personal.linkedin,
    resume.personal.github,
    resume.personal.portfolio,
  ].filter(Boolean);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${resume.personal.name} - Resume</title>
  ${styles}
</head>
<body>
  <div class="header">
    <h1>${resume.personal.name}</h1>
    <div class="title">${resume.personal.title}</div>
    <div class="contact">
      ${contactItems.map((item) => `<span>${item}</span>`).join(" | ")}
    </div>
  </div>

  ${
    resume.summary
      ? `
  <div class="section summary">
    <h2>Professional Summary</h2>
    <p>${resume.summary}</p>
  </div>
  `
      : ""
  }

  ${
    resume.skills.length > 0
      ? `
  <div class="section">
    <h2>Skills</h2>
    <div class="skills-grid">
      ${resume.skills
        .map(
          (group) => `
        <div class="skill-group">
          <span class="skill-label">${group.label}:</span>
          <span class="skill-items">${group.items.join(", ")}</span>
        </div>
      `
        )
        .join("")}
    </div>
  </div>
  `
      : ""
  }

  ${
    resume.experience.length > 0
      ? `
  <div class="section">
    <h2>Experience</h2>
    ${resume.experience
      .map(
        (exp) => `
      <div class="item">
        <div class="item-header">
          <div>
            <span class="item-title">${exp.title}</span>
            <span class="item-subtitle"> at ${exp.company}</span>
          </div>
          <span class="item-date">${exp.startDate} - ${
          exp.endDate || "Present"
        }</span>
        </div>
        ${
          exp.bullets.length > 0 && exp.bullets.some((b) => b.trim())
            ? `
        <ul>
          ${exp.bullets
            .filter((b) => b.trim())
            .map((bullet) => `<li>${bullet}</li>`)
            .join("")}
        </ul>
        `
            : ""
        }
      </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    resume.internships.length > 0
      ? `
  <div class="section">
    <h2>Internships</h2>
    ${resume.internships
      .map(
        (item) => `
      <div class="item">
        <div class="item-header">
          <div>
            <span class="item-title">${item.title}</span>
            <span class="item-subtitle"> at ${item.organization}</span>
          </div>
          <span class="item-date">${item.startDate} - ${item.endDate}</span>
        </div>
        ${
          item.bullets.length > 0 && item.bullets.some((b) => b.trim())
            ? `
        <ul>
          ${item.bullets
            .filter((b) => b.trim())
            .map((bullet) => `<li>${bullet}</li>`)
            .join("")}
        </ul>
        `
            : ""
        }
      </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    resume.volunteering.length > 0
      ? `
  <div class="section">
    <h2>Volunteering</h2>
    ${resume.volunteering
      .map(
        (item) => `
      <div class="item">
        <div class="item-header">
          <div>
            <span class="item-title">${item.role}</span>
            <span class="item-subtitle"> at ${item.organization}</span>
          </div>
          <span class="item-date">${item.year}</span>
        </div>
        ${
          item.bullets.length > 0 && item.bullets.some((b) => b.trim())
            ? `
        <ul>
          ${item.bullets
            .filter((b) => b.trim())
            .map((bullet) => `<li>${bullet}</li>`)
            .join("")}
        </ul>
        `
            : ""
        }
      </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    resume.publications.length > 0
      ? `
  <div class="section">
    <h2>Publications</h2>
    ${resume.publications
      .map(
        (item) => `
      <div class="item">
        <div class="item-header">
          <div>
            <span class="item-title">${item.title}</span>
            <span class="item-subtitle"> - ${item.outlet}</span>
          </div>
          <span class="item-date">${item.year}</span>
        </div>
        ${
          item.link
            ? `<p style="font-size: 10pt; color: #64748b;">${item.link}</p>`
            : ""
        }
      </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    resume.customSections && resume.customSections.length > 0
      ? resume.customSections
          .map(
            (section) => `
      <div class="section">
        <h2>${section.title}</h2>
        <ul>
          ${section.items
            .filter((i) => i.content.trim())
            .map((item) => `<li>${item.content}</li>`)
            .join("")}
        </ul>
      </div>
    `
          )
          .join("")
      : ""
  }

</body>
</html>
  `;
}
