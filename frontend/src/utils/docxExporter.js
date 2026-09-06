import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  HeadingLevel, 
  BorderStyle, 
  PageBreak,
  Header,
  Footer,
  TabStopType,
  LeaderType
} from 'docx';

const PRIMARY_COLOR = "0A2A5C";
const SECONDARY_COLOR = "0072CE";
const TEXT_COLOR = "2B2B2B";

function createStyledTable(headers, rows, colWidths = []) {
  const headerCells = headers.map((h, i) => new TableCell({
    width: colWidths[i] ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
    shading: { fill: "0A2A5C" },
    children: [
      new Paragraph({
        children: [new TextRun({ text: h, bold: true, color: "FFFFFF", font: "Calibri", size: 19 })],
        spacing: { before: 80, after: 80 }
      })
    ]
  }));

  const dataRows = rows.map((r, rIdx) => {
    const bg = rIdx % 2 === 0 ? "FFFFFF" : "F8FAFC";
    const cells = r.map((c, cIdx) => new TableCell({
      width: colWidths[cIdx] ? { size: colWidths[cIdx], type: WidthType.PERCENTAGE } : undefined,
      shading: { fill: bg },
      children: [
        new Paragraph({
          children: [new TextRun({ text: String(c), color: TEXT_COLOR, font: "Calibri", size: 18 })],
          spacing: { before: 60, after: 60 }
        })
      ]
    }));
    return new TableRow({ children: cells });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells, tableHeader: true }), ...dataRows]
  });
}

function createHeading(text, level = 1) {
  let size = 26;
  let color = PRIMARY_COLOR;
  let before = 240;
  let after = 80;

  if (level === 1) {
    size = 26;
    color = PRIMARY_COLOR;
  } else if (level === 2) {
    size = 22;
    color = SECONDARY_COLOR;
    before = 180;
    after = 60;
  } else if (level === 3) {
    size = 20;
    color = PRIMARY_COLOR;
    before = 140;
    after = 40;
  } else {
    size = 19;
    color = TEXT_COLOR;
    before = 100;
    after = 40;
  }

  return new Paragraph({
    spacing: { before, after },
    children: [new TextRun({ text, bold: true, color, font: "Calibri", size })]
  });
}

export async function exportDocxClient(data) {
  const projectName = data?.project_name || "Enterprise Copilot & Data Platform";
  const version = data?.version || "0.1";
  const dateStr = data?.date || new Date().toISOString().split('T')[0];
  const author = data?.author || "Lead Business Analyst";

  const tocList = [
    { title: "1   Version History", page: "4", level: 1 },
    { title: "2   File Details", page: "4", level: 1 },
    { title: "3   Functional Process Flow Diagram", page: "4", level: 1 },
    { title: "4   In Scope Requirements", page: "5", level: 1 },
    { title: "4.1   Functional Requirements", page: "5", level: 2 },
    { title: "4.1.1   3 document types", page: "5", level: 3 },
    { title: "4.1.2   Canned Questions", page: "5", level: 3 },
    { title: "4.1.3   Ability to ask ad-hoc questions", page: "5", level: 3 },
    { title: "4.1.4   Download Q&A in CSV format", page: "5", level: 3 },
    { title: "4.1.5   Reference Source doc page numbers in response", page: "5", level: 3 },
    { title: "4.1.6   Accuracy of the answers in-line with POC", page: "5", level: 3 },
    { title: "4.1.7   Support only desktop browsers - Edge & Chrome", page: "5", level: 3 },
    { title: "4.2   Non - Functional Requirements", page: "5", level: 2 },
    { title: "4.2.1   Integration with Lockton AD (Group based authentication)", page: "5", level: 3 },
    { title: "4.2.2   Performance in-line with POC", page: "5", level: 3 },
    { title: "4.2.3   Auditing, logging, and error handling", page: "5", level: 3 },
    { title: "4.2.4   Hook logs into existing monitoring system", page: "5", level: 3 },
    { title: "4.2.5   Application accessible within enterprise env. only", page: "5", level: 3 },
    { title: "4.2.6   Only PDF documents (<5MB) supported", page: "5", level: 3 },
    { title: "5   Out Of Scope Requirements", page: "5", level: 1 },
    { title: "5.1.1   New document types such as Cyber policies", page: "5", level: 2 },
    { title: "5.1.2   New canned questions including prompt tuning", page: "5", level: 2 },
    { title: "5.1.3   Admin interface (configuration via DB)", page: "5", level: 2 },
    { title: "5.1.4   Multi-region provisioning of LLM (Azure OpenAI)", page: "5", level: 2 },
    { title: "5.1.5   Performance, Security & Automation testing", page: "5", level: 2 },
    { title: "5.1.6   Support for mobile devices", page: "5", level: 2 },
    { title: "5.1.7   Availability (handled in subsequent phases)", page: "5", level: 2 },
    { title: "5.1.8   Provisioning / configuration of CI/CD Pipeline", page: "5", level: 2 },
    { title: "5.1.9   Workflow solution include Document based Auth", page: "5", level: 2 },
    { title: "6   EPICS (Functional)", page: "6", level: 1 },
    { title: "6.1   EPIC 1 - DASHBOARD PAGE", page: "6", level: 2 },
    { title: "6.1.1   FEATURE 1: DEAL SUMMARY", page: "6", level: 3 },
    { title: "6.1.2   FEATURE 2: DEAL DETAILS", page: "9", level: 3 },
    { title: "6.1.3   FEATURE 3: CREATE NEW DEAL", page: "13", level: 3 },
    { title: "6.1.4   FEATURE 4: DOCUMENT SUMMARY", page: "17", level: 3 },
    { title: "6.2   EPIC 2 - CHATBOT PAGE", page: "21", level: 2 },
    { title: "6.2.1   FEATURE 1: CHATBOT FEATURES", page: "21", level: 3 },
    { title: "6.2.2   FEATURE 2: QUESTION TAGS TAB", page: "22", level: 3 },
    { title: "6.2.3   FEATURE 3: ALL FAQS TAB", page: "24", level: 3 },
    { title: "6.2.4   FEATURE 4: CHAT BOX", page: "24", level: 3 },
    { title: "6.2.5   FEATURE 5: CHAT ACCESS OPTIONS", page: "24", level: 3 },
    { title: "7   EPICS (Non-Functional)", page: "26", level: 1 },
    { title: "7.1   EPIC 1 - APPLICATION ACCESSIBILITY", page: "26", level: 2 },
    { title: "7.1.1   FEATURE 1: APPLICATION BROWSER", page: "26", level: 3 },
    { title: "7.1.2   FEATURE 2: APPLICATION LOGIN", page: "26", level: 3 },
    { title: "7.1.3   FEATURE 3: APPLICATION SECURITY", page: "26", level: 3 },
    { title: "7.2   EPIC 2 - EXCEPTION HANDLING", page: "27", level: 2 },
    { title: "7.2.1   FEATURE 1: DOCUMENT UPLOAD", page: "27", level: 3 },
    { title: "7.2.2   FEATURE 2: DOCUMENT PROCESSING", page: "27", level: 3 },
    { title: "7.2.3   FEATURE 3: QUERY RESPONSE TIMING", page: "28", level: 3 },
    { title: "7.3   EPIC 3 - APPLICATION MONITORING", page: "28", level: 2 },
    { title: "7.3.1   FEATURE 1: AUDITING", page: "28", level: 3 },
    { title: "7.3.2   FEATURE 2: LOGGING", page: "28", level: 3 },
    { title: "7.3.3   FEATURE 3: MONITORING", page: "29", level: 3 },
    { title: "8   USER STORIES ALIGNMENT WITH POC", page: "29", level: 1 },
    { title: "9   REFERENCE DOCUMENTS", page: "30", level: 1 }
  ];

  const tocParagraphs = tocList.map(item => {
    const indent = item.level === 1 ? 0 : item.level === 2 ? 360 : 720;
    const isBold = item.level === 1;
    const color = item.level === 1 ? PRIMARY_COLOR : item.level === 2 ? PRIMARY_COLOR : TEXT_COLOR;
    const size = item.level === 1 ? 19 : 18;

    return new Paragraph({
      indent: { left: indent },
      spacing: { before: 30, after: 30 },
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: 9500,
          leader: LeaderType.DOT
        }
      ],
      children: [
        new TextRun({ text: item.title, bold: isBold, color, font: "Calibri", size }),
        new TextRun({ text: "\t", font: "Calibri" }),
        new TextRun({ text: item.page, bold: isBold, color, font: "Calibri", size })
      ]
    });
  });

  const children = [
    // COVER PAGE
    new Paragraph({
      spacing: { before: 400, after: 100 },
      children: [new TextRun({ text: projectName, bold: true, color: PRIMARY_COLOR, font: "Calibri", size: 48 })]
    }),
    new Paragraph({
      spacing: { before: 0, after: 300 },
      children: [new TextRun({ text: "Business Requirements Document (BRD)", color: SECONDARY_COLOR, font: "Calibri", size: 28 })]
    }),
    new Paragraph({
      spacing: { before: 0, after: 100 },
      children: [new TextRun({ text: `Document Version: ${version}`, color: TEXT_COLOR, font: "Calibri", size: 20 })]
    }),
    new Paragraph({
      spacing: { before: 0, after: 100 },
      children: [new TextRun({ text: `Date: ${dateStr}`, color: TEXT_COLOR, font: "Calibri", size: 20 })]
    }),
    new Paragraph({
      spacing: { before: 0, after: 100 },
      children: [new TextRun({ text: `Author: ${author}`, color: TEXT_COLOR, font: "Calibri", size: 20 })]
    }),
    new Paragraph({
      spacing: { before: 0, after: 500 },
      children: [new TextRun({ text: "Status: Updated Requirements, Features and User Stories", color: TEXT_COLOR, font: "Calibri", size: 20 })]
    }),

    // DEDICATED TABLE OF CONTENTS (INDEX PAGE)
    new Paragraph({ children: [new PageBreak()] }),
    createHeading("Table of Contents", 1),
    ...tocParagraphs,

    // SECTION 1: VERSION HISTORY
    new Paragraph({ children: [new PageBreak()] }),
    createHeading("1  Version History", 1),
    createStyledTable(
      ["Version No.", "Updated By", "Updates"],
      data?.version_history || [["0.1", author, "Updated Requirements, Features and User Stories"]],
      [20, 35, 45]
    ),

    // SECTION 2: FILE DETAILS
    createHeading("2  File Details", 1),
    createStyledTable(
      ["File Name", "File Format", "File Location"],
      data?.file_details || [[`${projectName.replace(/\s+/g, '_')}_BRD`, "Docx", "Requirements Vault"]],
      [40, 20, 40]
    ),

    // SECTION 3: FUNCTIONAL PROCESS FLOW DIAGRAM
    createHeading("3  Functional Process Flow Diagram", 1),
    new Paragraph({
      children: [new TextRun({ text: "MVP to Production | User Flow", bold: true, color: PRIMARY_COLOR, font: "Calibri", size: 20 })],
      spacing: { before: 100, after: 80 }
    }),
    ...(data?.process_flow_steps || [
      "1. The Business Analyst navigates to the application on supported desktop browser (Edge / Chrome).",
      "2. On the home page, the user selects an existing project/deal folder or creates a new deal.",
      "3. User selects document type from the local drive and uploads source documents.",
      "4. The documents are uploaded to secure storage vault and queued for automated processing.",
      "5. The backend pipeline processes document text, schema validation, and vector embeddings.",
      "6. The system notifies the user via status indicator / email once document processing is complete.",
      "7. The user navigates to the interactive workspace to query records or execute ad-hoc validation.",
      "8. The user exports structured reports and generated requirements to CSV or styled .docx format."
    ]).map(step => new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: step, color: TEXT_COLOR, font: "Calibri", size: 19 })]
    })),

    // SECTION 4: IN SCOPE REQUIREMENTS
    createHeading("4  In Scope Requirements", 1),
    createHeading("4.1 Functional Requirements", 2),
    ...(data?.in_scope_functional || [
      { id: "4.1.1", title: "Multi-document type ingestion support", sub: ["a. ESA", "b. Contract & Leases", "c. CIM"] },
      { id: "4.1.2", title: "Pre-configured Analytical Question Sets (Canned Prompts)", sub: ["a. ESA (10)", "b. Contract & Leases (5)", "c. CIM (16)"] },
      { id: "4.1.3", title: "Ability to ask ad-hoc questions", sub: [] },
      { id: "4.1.4", title: "Download Q&A in CSV format", sub: [] },
      { id: "4.1.5", title: "Reference Source doc page numbers in response (accuracy in-line with POC)", sub: [] },
      { id: "4.1.6", title: "Accuracy of the answers (canned & ad-hoc) in-line with the POC", sub: [] },
      { id: "4.1.7", title: "Support only desktop browsers - Edge & Chrome (latest and latest-1 versions)", sub: [] }
    ]).flatMap(req => [
      new Paragraph({
        spacing: { before: 60, after: 30 },
        children: [new TextRun({ text: `${req.id}  ${req.title}`, bold: true, color: PRIMARY_COLOR, font: "Calibri", size: 19 })]
      }),
      ...(req.sub || []).map(s => new Paragraph({
        indent: { left: 400 },
        spacing: { before: 20, after: 20 },
        children: [new TextRun({ text: s, color: TEXT_COLOR, font: "Calibri", size: 18 })]
      }))
    ]),

    createHeading("4.2 Non - Functional Requirements", 2),
    ...(data?.in_scope_nfr || [
      { id: "4.2.1", text: "Integration with Enterprise AD (Group based authentication)." },
      { id: "4.2.2", text: "Performance in-line with POC (Doc Processing 60-90s, Query response <60s)." },
      { id: "4.2.3", text: "Auditing, logging, and error handling will be enhanced to support the system." },
      { id: "4.2.4", text: "For monitoring Lockton can hook the logs into existing monitoring system." },
      { id: "4.2.5", text: "Application will be accessible to authorized corporate employee users within enterprise network only." },
      { id: "4.2.6", text: "Only allowed documents (<25MB) will be supported." }
    ]).map(nfr => new Paragraph({
      spacing: { before: 50, after: 40 },
      children: [new TextRun({ text: `${nfr.id}  ${nfr.text}`, color: TEXT_COLOR, font: "Calibri", size: 19 })]
    })),

    // SECTION 5: OUT OF SCOPE REQUIREMENTS
    createHeading("5  Out Of Scope Requirements", 1),
    ...(data?.out_of_scope || [
      "5.1.1  New document types such as Cyber policies.",
      "5.1.2  New canned questions including prompt tuning for existing questions.",
      "5.1.3  Admin interface (configuration to be done manually via config files/DB).",
      "5.1.4  Multi-region provisioning of LLM (Azure OpenAI), including DR.",
      "5.1.5  Performance, Security & Automation testing in production.",
      "5.1.6  Support for mobile devices.",
      "5.1.7  Availability (to be handled in subsequent phases)."
    ]).map(item => new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: item, color: TEXT_COLOR, font: "Calibri", size: 19 })]
    })),

    // SECTION 6: EPICS (FUNCTIONAL)
    createHeading("6  EPICS (Functional)", 1),
    ...(data?.functional_epics || []).flatMap(epic => [
      createHeading(`${epic.epic_id} ${epic.epic_title}`, 2),
      ...(epic.features || []).flatMap(feat => [
        createHeading(`${feat.feature_id} ${feat.feature_title}`, 3),
        ...(feat.user_stories || []).flatMap(story => [
          createHeading(`${story.id} ${story.title}`, 4),
          new Paragraph({
            indent: { left: 240 },
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: `${story.id}.1 Description: `, bold: true, font: "Calibri", size: 18 }),
              new TextRun({ text: `"${story.description}"`, italic: true, font: "Calibri", size: 18 })
            ]
          }),
          new Paragraph({
            indent: { left: 240 },
            spacing: { before: 40, after: 30 },
            children: [new TextRun({ text: `${story.id}.2 Acceptance Criteria:`, bold: true, font: "Calibri", size: 18 })]
          }),
          ...(story.acceptance_criteria || []).map(ac => new Paragraph({
            indent: { left: 400 },
            spacing: { before: 20, after: 20 },
            children: [new TextRun({ text: ac, font: "Calibri", size: 18 })]
          })),
          story.screenshot_ref ? new Paragraph({
            indent: { left: 240 },
            spacing: { before: 40, after: 40 },
            children: [new TextRun({ text: story.screenshot_ref, color: SECONDARY_COLOR, italic: true, font: "Calibri", size: 17 })]
          }) : new Paragraph({})
        ])
      ])
    ]),

    // SECTION 7: EPICS (NON-FUNCTIONAL)
    createHeading("7  EPICS (Non-Functional)", 1),
    ...(data?.non_functional_epics || []).flatMap(epic => [
      createHeading(`${epic.epic_id} ${epic.epic_title}`, 2),
      ...(epic.features || []).flatMap(feat => [
        createHeading(feat.title, 3),
        createHeading(feat.story_title, 4),
        new Paragraph({
          indent: { left: 240 },
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({ text: "Description: ", bold: true, font: "Calibri", size: 18 }),
            new TextRun({ text: `"${feat.description}"`, italic: true, font: "Calibri", size: 18 })
          ]
        }),
        ...(feat.acceptance || []).map(ac => new Paragraph({
          indent: { left: 400 },
          spacing: { before: 20, after: 20 },
          children: [new TextRun({ text: ac, font: "Calibri", size: 18 })]
        }))
      ])
    ]),

    // SECTION 8: USER STORIES ALIGNMENT WITH POC
    createHeading("8  USER STORIES ALIGNMENT WITH POC", 1),
    new Paragraph({
      spacing: { before: 60, after: 60 },
      children: [
        new TextRun({
          text: "All functional epics, deal features, and chatbot question tags specified in this document have been validated against the exploratory Proof of Concept (POC) baseline. Acceptance criteria maintain parity with demonstrated response timings (<90 seconds for document parsing and <60 seconds for complex query generation) while strictly preserving source document page citations and desktop browser support.",
          font: "Calibri",
          size: 19
        })
      ]
    }),

    // SECTION 9: REFERENCE DOCUMENTS
    createHeading("9  REFERENCE DOCUMENTS", 1),
    createStyledTable(
      ["TOPIC", "REFERENCE DOCUMENT"],
      data?.reference_documents || [
        ["PROJECT SOW PPT", "Statement_of_Work_Final.pptx"],
        ["CANNED QUESTIONS MATRIX", "Canned_Questions_and_Prompts.xlsx"],
        ["ARCHITECTURE BLUEPRINT", "Target_State_Architecture_v2.pdf"]
      ],
      [50, 50]
    )
  ];

  const doc = new Document({
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "<Function Name> <Sub Function Name> <Name of Process> | (Ver. 2.1/2026)",
                    color: "78828C",
                    font: "Calibri",
                    size: 17
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Privileged and Confidential 2026",
                    color: "A0AAB4",
                    font: "Calibri",
                    size: 16
                  })
                ]
              })
            ]
          })
        },
        children
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  const safeName = projectName.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `BRD_${safeName}.docx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  return true;
}
