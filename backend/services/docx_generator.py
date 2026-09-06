import os
from typing import Dict, Any, List
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

PRIMARY_COLOR = RGBColor(10, 42, 92)     # #0A2A5C Deep Corporate Navy
SECONDARY_COLOR = RGBColor(0, 114, 206)  # #0072CE Enterprise Blue
ACCENT_ORANGE = RGBColor(230, 81, 0)    # #E65100 Accent
TEXT_COLOR = RGBColor(40, 44, 52)        # Charcoal Text
LIGHT_BG_HEX = "F0F4F8"                  # Header table background
BORDER_HEX = "CBD5E1"                    # Subtle table border

def set_cell_shading(cell, color_hex: str):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    tcPr.append(shd)

def set_table_borders(table, color_hex=BORDER_HEX):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="single" w:sz="6" w:space="0" w:color="{color_hex}"/>'
        f'  <w:bottom w:val="single" w:sz="6" w:space="0" w:color="{color_hex}"/>'
        f'  <w:left w:val="single" w:sz="4" w:space="0" w:color="{color_hex}"/>'
        f'  <w:right w:val="single" w:sz="4" w:space="0" w:color="{color_hex}"/>'
        f'  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color_hex}"/>'
        f'  <w:insideV w:val="single" w:sz="4" w:space="0" w:color="{color_hex}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def format_cell_text(cell, text: str, bold: bool = False, color: RGBColor = TEXT_COLOR, font_size: int = 10, align=WD_ALIGN_PARAGRAPH.LEFT):
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.space_before = Pt(2)
    run = p.add_run(str(text if text is not None else ""))
    run.font.name = 'Calibri'
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.color.rgb = color

def add_styled_table(doc: Document, headers: List[str], rows: List[List[Any]], col_widths: List[float] = None):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table)
    
    # Header row
    hdr_row = table.rows[0]
    for idx, header in enumerate(headers):
        cell = hdr_row.cells[idx]
        set_cell_shading(cell, LIGHT_BG_HEX)
        format_cell_text(cell, header, bold=True, color=PRIMARY_COLOR, font_size=10)
        
    # Content rows
    for r_idx, row_data in enumerate(rows):
        row = table.rows[1 + r_idx]
        row_bg = "FFFFFF" if r_idx % 2 == 0 else "F8FAFC"
        for c_idx, cell_value in enumerate(row_data):
            if c_idx < len(row.cells):
                cell = row.cells[c_idx]
                if row_bg != "FFFFFF":
                    set_cell_shading(cell, row_bg)
                format_cell_text(cell, str(cell_value), bold=False, color=TEXT_COLOR, font_size=9.5)
                
    if col_widths and len(col_widths) == len(headers):
        for row in table.rows:
            for idx, width in enumerate(col_widths):
                row.cells[idx].width = Inches(width)
                
    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    return table

def add_heading_styled(doc: Document, text: str, level: int):
    heading = doc.add_heading(text, level=level)
    run = heading.runs[0] if heading.runs else heading.add_run(text)
    run.font.name = 'Calibri'
    if level == 1:
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = PRIMARY_COLOR
        heading.paragraph_format.space_before = Pt(14)
        heading.paragraph_format.space_after = Pt(4)
    elif level == 2:
        run.font.size = Pt(12.5)
        run.font.bold = True
        run.font.color.rgb = SECONDARY_COLOR
        heading.paragraph_format.space_before = Pt(10)
        heading.paragraph_format.space_after = Pt(3)
    elif level == 3:
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = PRIMARY_COLOR
        heading.paragraph_format.space_before = Pt(8)
        heading.paragraph_format.space_after = Pt(2)
    else:
        run.font.size = Pt(10)
        run.font.bold = True
        run.font.color.rgb = TEXT_COLOR
        heading.paragraph_format.space_before = Pt(6)
        heading.paragraph_format.space_after = Pt(2)
    return heading

def add_callout_box(doc: Document, title: str, text: str):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.rows[0].cells[0]
    cell.width = Inches(6.5)
    set_cell_shading(cell, "F1F5F9")
    
    # Left border only (accent line)
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'  <w:top w:val="none"/>'
        f'  <w:bottom w:val="none"/>'
        f'  <w:left w:val="single" w:sz="24" w:space="0" w:color="0072CE"/>'
        f'  <w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(2)
    run_t = p.add_run(title + "\n")
    run_t.font.name = 'Calibri'
    run_t.font.size = Pt(9.5)
    run_t.font.bold = True
    run_t.font.color.rgb = PRIMARY_COLOR
    
    run_b = p.add_run(text)
    run_b.font.name = 'Calibri'
    run_b.font.size = Pt(9)
    run_b.font.color.rgb = TEXT_COLOR
    
    doc.add_paragraph().paragraph_format.space_after = Pt(2)

def build_docx_brd(data: Dict[str, Any], output_path: str) -> str:
    doc = Document()
    
    # Page Margins (0.8 inch for clean corporate standard)
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)
        
        # Header setup matching PDF
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("<Function Name> <Sub Function Name> <Name of Process> | (Ver. 2.1/2026)")
        hrun.font.name = 'Calibri'
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(120, 130, 140)
        
    project_name = data.get("project_name", "Enterprise Copilot & Data Platform")
    version = data.get("version", "0.1")
    date_str = data.get("date", "2026-09-06")
    author = data.get("author", "Lead Business Analyst")
    
    # COVER / TITLE BLOCK
    doc.add_paragraph().paragraph_format.space_before = Pt(24)
    title_p = doc.add_paragraph()
    title_run = title_p.add_run(project_name)
    title_run.font.name = 'Calibri'
    title_run.font.size = Pt(26)
    title_run.font.bold = True
    title_run.font.color.rgb = PRIMARY_COLOR
    
    subtitle_p = doc.add_paragraph()
    sub_run = subtitle_p.add_run("Business Requirements Document (BRD)")
    sub_run.font.name = 'Calibri'
    sub_run.font.size = Pt(15)
    sub_run.font.color.rgb = SECONDARY_COLOR
    subtitle_p.paragraph_format.space_after = Pt(16)
    
    meta_p = doc.add_paragraph()
    meta_p.add_run(f"Document Version: {version}\nDate: {date_str}\nAuthor: {author}\nStatus: Updated Requirements, Features and User Stories").font.color.rgb = TEXT_COLOR
    meta_p.paragraph_format.space_after = Pt(24)
    
    # TABLE OF CONTENTS SUMMARY (Matching Page 2 of user's PDF)
    add_heading_styled(doc, "Table of Contents", 1)
    toc_items = [
        "1 Version History",
        "2 File Details",
        "3 Functional Process Flow Diagram",
        "4 In Scope Requirements",
        "   4.1 Functional Requirements",
        "   4.2 Non-Functional Requirements",
        "5 Out Of Scope Requirements",
        "6 EPICS (Functional)",
        "   6.1 EPIC 1 - DASHBOARD PAGE",
        "   6.2 EPIC 2 - CHATBOT PAGE",
        "7 EPICS (Non-Functional)",
        "   7.1 EPIC 1 - APPLICATION ACCESSIBILITY",
        "   7.2 EPIC 2 - EXCEPTION HANDLING",
        "   7.3 EPIC 3 - APPLICATION MONITORING",
        "8 REFERENCE DOCUMENTS"
    ]
    for item in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(1)
        run = p.add_run(item)
        run.font.name = 'Calibri'
        run.font.size = Pt(9.5)
        run.font.color.rgb = PRIMARY_COLOR if not item.startswith("   ") else SECONDARY_COLOR
        
    doc.add_page_break()
    
    # 1. VERSION HISTORY (Matching Page 3 of user's PDF)
    add_heading_styled(doc, "1  Version History", 1)
    ver_headers = ["Version No.", "Updated By", "Updates"]
    ver_rows = data.get("version_history", [
        ["0.1", author, "Updated Requirements, Features and User Stories based on source discovery"]
    ])
    add_styled_table(doc, ver_headers, ver_rows, [1.2, 2.0, 3.3])
    
    # 2. FILE DETAILS (Matching Page 3 of user's PDF)
    add_heading_styled(doc, "2  File Details", 1)
    file_headers = ["File Name", "File Format", "File Location"]
    file_rows = data.get("file_details", [
        [f"{project_name.replace(' ', '_')}_BRD", "Docx", "Requirements Vault"]
    ])
    add_styled_table(doc, file_headers, file_rows, [2.5, 1.5, 2.5])
    
    # 3. FUNCTIONAL PROCESS FLOW DIAGRAM (Matching Page 3 of user's PDF)
    add_heading_styled(doc, "3  Functional Process Flow Diagram", 1)
    doc.add_paragraph("MVP to Production | User Flow").runs[0].font.bold = True
    
    flow_steps = data.get("process_flow_steps", [
        "1. The Business Analyst / TAP analyst navigates to the application on supported desktop browser (Edge / Chrome).",
        "2. On the home page, the user selects an existing project/deal folder or creates a new deal.",
        "3. User selects document type from the local drive and uploads source documents.",
        "4. The documents are uploaded to secure storage vault and queued for automated processing.",
        "5. The backend pipeline processes document text, schema validation, and vector embeddings.",
        "6. The system notifies the user via status indicator / email once document processing is complete.",
        "7. The user navigates to the interactive workspace to query records or execute ad-hoc validation.",
        "8. The user exports structured reports and generated requirements to CSV or styled .docx format."
    ])
    for step in flow_steps:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run(step)
        run.font.name = 'Calibri'
        run.font.size = Pt(9.5)
        
    doc.add_paragraph().paragraph_format.space_after = Pt(6)
    
    # 4. IN SCOPE REQUIREMENTS (Matching Page 5 of user's PDF)
    add_heading_styled(doc, "4  In Scope Requirements", 1)
    
    # 4.1 Functional Requirements
    add_heading_styled(doc, "4.1 Functional Requirements", 2)
    in_scope_func = data.get("in_scope_functional", [
        {"id": "4.1.1", "title": "Multi-document type ingestion support", "sub": ["a. Executive & Discovery Notes", "b. Contract & Process Architecture Docs", "c. Schema & Field Dictionaries (CSV/XLSX)"]},
        {"id": "4.1.2", "title": "Pre-configured Analytical Question Sets (Canned Prompts)", "sub": ["a. Stakeholder Extraction", "b. Flow & System Extraction", "c. Risk & Constraint Mapping"]},
        {"id": "4.1.3", "title": "Ability to execute ad-hoc analysis and custom BA prompt refinement.", "sub": []},
        {"id": "4.1.4", "title": "Download Q&A and Requirement Matrix in CSV / DOCX format.", "sub": []},
        {"id": "4.1.5", "title": "Reference source document page numbers and citation lines in response.", "sub": []},
        {"id": "4.1.6", "title": "High accuracy response validation in-line with corporate guidelines.", "sub": []},
        {"id": "4.1.7", "title": "Support modern desktop browsers (Microsoft Edge & Google Chrome - latest and latest-1 versions).", "sub": []}
    ])
    for req in in_scope_func:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(1)
        r1 = p.add_run(f"{req['id']}  {req['title']}")
        r1.font.bold = True
        r1.font.size = Pt(9.5)
        for s in req.get("sub", []):
            sp = doc.add_paragraph()
            sp.paragraph_format.left_indent = Inches(0.3)
            sp.paragraph_format.space_before = Pt(1)
            sp.paragraph_format.space_after = Pt(1)
            sp_run = sp.add_run(s)
            sp_run.font.size = Pt(9)
            
    # 4.2 Non-Functional Requirements
    add_heading_styled(doc, "4.2 Non-Functional Requirements", 2)
    nfr_items = data.get("in_scope_nfr", [
        {"id": "4.2.1", "text": "Integration with Enterprise AD / SSO (Group based authentication & RBAC)."},
        {"id": "4.2.2", "text": "Performance & Response Latency:\n  a. Document Processing: 60 to 90 seconds (per document) based on complexity and length.\n  b. Real-time query response: Under 1500ms to 3000ms."},
        {"id": "4.2.3", "text": "Auditing, logging, and comprehensive error handling across all API gateways."},
        {"id": "4.2.4", "text": "Centralized application monitoring hooked into enterprise telemetry (Azure Monitor / CloudWatch)."},
        {"id": "4.2.5", "text": "Application access restricted to authorized corporate network employees only."},
        {"id": "4.2.6", "text": "Only allowed document formats supported with individual file size limit (<25MB)."}
    ])
    for nfr in nfr_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(1)
        r = p.add_run(f"{nfr['id']}  {nfr['text']}")
        r.font.size = Pt(9.5)
        
    # 5. OUT OF SCOPE REQUIREMENTS (Matching Page 5 of user's PDF)
    add_heading_styled(doc, "5  Out Of Scope Requirements", 1)
    out_of_scope = data.get("out_of_scope", [
        "5.1.1  Unstructured legacy audio and video media files without transcriptions.",
        "5.1.2  Direct customer-facing external consumer checkout application.",
        "5.1.3  Manual database administration interface (configuration handled via secure config files/APIs).",
        "5.1.4  Multi-region geo-redundant provisioning outside primary cloud tenant.",
        "5.1.5  Third-party penetration testing and destructive load testing in production.",
        "5.1.6  Native mobile device applications (iOS/Android) — desktop web browser prioritized.",
        "5.1.7  Legacy batch mainframe synchronization (scheduled for retirement)."
    ])
    for item in out_of_scope:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(1)
        run = p.add_run(item)
        run.font.size = Pt(9.5)
        run.font.color.rgb = TEXT_COLOR
        
    # 6. EPICS (FUNCTIONAL) (Matching Pages 4, 6, 7, 10-13 of user's PDF)
    add_heading_styled(doc, "6  EPICS (Functional)", 1)
    
    functional_epics = data.get("functional_epics", [
        {
            "epic_id": "6.1",
            "epic_title": "EPIC 1 - DASHBOARD & WORKFLOW PAGE",
            "features": [
                {
                    "feature_id": "6.1.1",
                    "feature_title": "FEATURE 1: DEAL & TRANSACTION SUMMARY",
                    "user_stories": [
                        {
                            "id": "6.1.1.1",
                            "title": "User Story 1: Ability to land on the Dashboard Page",
                            "description": "As a Business Analyst / TAP Analyst, I should be able to land on the Dashboard Page so that I can view and select the required pipeline information therein.",
                            "acceptance_criteria": [
                                "i. Verify that application redirects the user to the Dashboard Page after successful SSO authentication.",
                                "ii. Verify that unauthorized users are redirected to login with an appropriate error banner."
                            ],
                            "screenshot_ref": "[Reference Screenshot: Dashboard Landing Page View with Navigation Bar & User Profile]"
                        },
                        {
                            "id": "6.1.1.2",
                            "title": "User Story 2: Ability to view all features on Dashboard Page",
                            "description": "As a Business Analyst, I should be able to view all features on the Dashboard Page so that I can interact with deals and processing queues.",
                            "acceptance_criteria": [
                                "i. Verify that application enables view of all features on the Dashboard Page as:",
                                "   a. Deal Summary Table (Deal ID, Deal Name, Generated By, Priority, Creation Timestamp, Status)",
                                "   b. Global Search Bar",
                                "   c. Table Refresh Button",
                                "   d. Create New Deal / Workflow Button",
                                "   e. Pagination controls (Rows per page, Previous/Next page)"
                            ],
                            "screenshot_ref": "[Reference Screenshot: Deal Summary Table with Filter & Pagination Controls]"
                        },
                        {
                            "id": "6.1.1.3",
                            "title": "User Story 3: Ability to filter and search within Deal Summary table",
                            "description": "As a Business Analyst, I should be able to filter by keyword and priority so that I can quickly pinpoint relevant project items.",
                            "acceptance_criteria": [
                                "i. Verify that application filters rows dynamically based on keyword search query.",
                                "ii. Verify that priority dropdown allows filtering by High, Standard, and Low states."
                            ],
                            "screenshot_ref": "[Reference Screenshot: Filter Dropdown & Search Results Grid]"
                        }
                    ]
                }
            ]
        },
        {
            "epic_id": "6.2",
            "epic_title": "EPIC 2 - INTERACTIVE ANALYSIS & CHATBOT PAGE",
            "features": [
                {
                    "feature_id": "6.2.1",
                    "feature_title": "FEATURE 1: CHATBOT & SYNTHESIS FEATURES",
                    "user_stories": [
                        {
                            "id": "6.2.1.1",
                            "title": "User Story 1: Ability to query document and review synthesized requirements",
                            "description": "As a Business Analyst, I should be able to submit questions and prompts against ingested documents so that I receive contextual answers with source citations.",
                            "acceptance_criteria": [
                                "i. Verify that application enables view of all features on the Chatbot Page as:",
                                "   a. Chat transcript box with source doc page citations",
                                "   b. Back option to return to deal summary",
                                "   c. Show History and Clear Chat actions",
                                "   d. Export to CSV & Word action",
                                "   e. Pre-defined Question Tags tab"
                            ],
                            "screenshot_ref": "[Reference Screenshot: Interactive Chatbot Screen with Question Tags & Document Viewer]"
                        }
                    ]
                },
                {
                    "feature_id": "6.2.2",
                    "feature_title": "FEATURE 2: QUESTION TAGS & CANNED PROMPTS TAB",
                    "user_stories": [
                        {
                            "id": "6.2.2.1",
                            "title": "User Story 1: Ability to view and select question tags for document types",
                            "description": "As a Business Analyst, I should be able to view and select question tags for each document type to trigger standardized requirements extraction.",
                            "acceptance_criteria": [
                                "i. Verify that selecting any question tag sends the pre-defined question to the right panel.",
                                "ii. Verify that tags are organized by document category (Executive Notes, Specifications, Data Dictionaries)."
                            ],
                            "screenshot_ref": "[Reference Screenshot: Question Tags Tab with Predefined Question Buttons]"
                        }
                    ]
                }
            ]
        }
    ])
    
    for epic in functional_epics:
        add_heading_styled(doc, f"{epic.get('epic_id', '6.x')} {epic.get('epic_title', 'EPIC')}", 2)
        for feat in epic.get("features", []):
            add_heading_styled(doc, f"{feat.get('feature_id', '6.x.x')} {feat.get('feature_title', 'FEATURE')}", 3)
            for story in feat.get("user_stories", []):
                add_heading_styled(doc, f"{story.get('id', '')} {story.get('title', '')}", 4)
                
                # Story Description
                dp = doc.add_paragraph()
                dp.paragraph_format.left_indent = Inches(0.15)
                dp.paragraph_format.space_before = Pt(2)
                dp.paragraph_format.space_after = Pt(2)
                d_run = dp.add_run(f"{story.get('id', '')}.1 Description\n")
                d_run.bold = True
                d_run.font.size = Pt(9.5)
                dp.add_run(story.get("description", "")).font.size = Pt(9.5)
                
                # Acceptance Criteria
                ac_p = doc.add_paragraph()
                ac_p.paragraph_format.left_indent = Inches(0.15)
                ac_p.paragraph_format.space_before = Pt(2)
                ac_p.paragraph_format.space_after = Pt(2)
                ac_run = ac_p.add_run(f"{story.get('id', '')}.2 Acceptance Criteria\n")
                ac_run.bold = True
                ac_run.font.size = Pt(9.5)
                for ac in story.get("acceptance_criteria", []):
                    ac_p.add_run(f"  {ac}\n").font.size = Pt(9)
                    
                # Reference Screenshot / Wireframe Box
                if story.get("screenshot_ref"):
                    add_callout_box(doc, f"{story.get('id', '')}.3 Reference Screenshot", story.get("screenshot_ref"))
                    
    # 7. EPICS (NON-FUNCTIONAL) (Matching Pages 9, 14, 15 of user's PDF)
    add_heading_styled(doc, "7  EPICS (Non-Functional)", 1)
    
    nfr_epics = data.get("non_functional_epics", [
        {
            "epic_id": "7.1",
            "epic_title": "EPIC 1 - APPLICATION ACCESSIBILITY",
            "features": [
                {
                    "title": "7.1.1 FEATURE 1: APPLICATION BROWSER",
                    "story_title": "7.1.1.1 User Story 1: Ability to navigate application in desktop browser",
                    "description": "User should be able to navigate to the application smoothly in supported corporate desktop browsers.",
                    "acceptance": [
                        "i. Verify that application navigation is supported in desktop browsers — Edge & Chrome in their latest and latest-1 version.",
                        "ii. Verify responsive layout renders without horizontal scrolling on minimum 1280x800 resolution."
                    ]
                },
                {
                    "title": "7.1.2 FEATURE 2: APPLICATION LOGIN & SSO",
                    "story_title": "7.1.2.1 User Story 1: Ability to integrate with Corporate Active Directory",
                    "description": "Application should have the ability to authorize and authenticate user's login via single sign-on.",
                    "acceptance": [
                        "i. Verify that application integrates with Azure AD / OAuth2 to validate group-based authentication.",
                        "ii. Verify that invalid login displays an appropriate error popup message.",
                        "iii. Verify that session token expires after 60 minutes of inactivity."
                    ]
                }
            ]
        },
        {
            "epic_id": "7.2",
            "epic_title": "EPIC 2 - EXCEPTION HANDLING",
            "features": [
                {
                    "title": "7.2.1 FEATURE 1: DOCUMENT UPLOAD RESTRICTIONS",
                    "story_title": "7.2.1.1 User Story 1: Document upload restrictions and validations",
                    "description": "Application should implement document upload restrictions and format validations.",
                    "acceptance": [
                        "i. Verify that broken API connectivity is handled through exception handling displaying clear error codes.",
                        "ii. Verify that unsupported file types trigger error message: 'Only supported business documents can be selected for upload.'",
                        "iii. Verify that files exceeding size limits display error message: 'File exceeds maximum allowable upload size.'",
                        "iv. Verify that maximum 5 documents can be selected in a single upload request."
                    ]
                },
                {
                    "title": "7.2.2 FEATURE 2: DOCUMENT PROCESSING & TIMEOUTS",
                    "story_title": "7.2.2.1 User Story 1: Document processing restrictions and validations",
                    "description": "Application should implement document processing timeouts and scaling restrictions.",
                    "acceptance": [
                        "i. Verify that single document processing does not exceed 90 seconds under normal queue load.",
                        "ii. Verify that timeout triggers an automated retry before failing with descriptive notification."
                    ]
                }
            ]
        },
        {
            "epic_id": "7.3",
            "epic_title": "EPIC 3 - APPLICATION MONITORING",
            "features": [
                {
                    "title": "7.3.1 FEATURE 1: AUDITING",
                    "story_title": "7.3.1.1 User Story 1: Audit logs for transactions and state transitions",
                    "description": "Application should maintain audit logs for all key user transactions and lifecycle state changes.",
                    "acceptance": [
                        "i. Verify that state changes are captured in database for Document Upload timestamp, Processed timestamp, and Reviewer ID.",
                        "ii. Verify audit logs are immutable and exportable for compliance review."
                    ]
                },
                {
                    "title": "7.3.2 FEATURE 2: LOGGING & ERROR TRACKING",
                    "story_title": "7.3.2.1 User Story 1: Application exception logging",
                    "description": "Application should log all warnings, errors, and system exceptions into centralized monitoring.",
                    "acceptance": [
                        "i. Verify that errors emit structured JSON logs including stack trace and correlation ID.",
                        "ii. Verify that critical errors trigger alerts to the on-call operations team."
                    ]
                }
            ]
        }
    ])
    
    for epic in nfr_epics:
        add_heading_styled(doc, f"{epic.get('epic_id', '7.x')} {epic.get('epic_title', '')}", 2)
        for feat in epic.get("features", []):
            add_heading_styled(doc, feat.get("title", ""), 3)
            add_heading_styled(doc, feat.get("story_title", ""), 4)
            
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.15)
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            p.add_run("Description\n").bold = True
            p.add_run(feat.get("description", "") + "\n\n")
            p.add_run("Acceptance Criteria\n").bold = True
            for ac in feat.get("acceptance", []):
                p.add_run(f"  {ac}\n")
                
    # 8. REFERENCE DOCUMENTS (Matching Page 8 of user's PDF)
    add_heading_styled(doc, "8  REFERENCE DOCUMENTS", 1)
    ref_headers = ["TOPIC", "REFERENCE DOCUMENT"]
    ref_rows = data.get("reference_documents", [
        ["PROJECT SOW & CHARTER", "Project_Statement_of_Work_Final.pptx"],
        ["CANNED QUESTIONS MATRIX", "Canned_Questions_and_Prompts.xlsx"],
        ["ARCHITECTURE BLUEPRINT", "Target_State_Architecture_v2.pdf"]
    ])
    add_styled_table(doc, ref_headers, ref_rows, [3.2, 3.3])
    
    doc.save(output_path)
    return output_path
