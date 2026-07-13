const APP_VERSION = "2026.07.13.2";

const DEFAULT_EMAIL_DIRECTORY = {
  "Tony FEI": {
    email: "tony.fei@fill-later.example",
    zhName: "费云青"
  },
  "Jolin LIU": {
    email: "jolin.liu@fill-later.example",
    zhName: "刘卓琳"
  },
  "Keith CHAN": {
    email: "keith.chan@fill-later.example",
    zhName: "陈敬"
  }
};

const SAMPLE_INPUT = `Company Report is ready for your perusal at the Published status.
Keith CHAN sent the following report:
**Is this report part of Sector Report?:** No
**Report Type:** Company Report
**Report Reason:** Company Update
**Main entity:** Cameco Corp
**Title:** Cameco Corp
**Document ID:** CR_54832
**Primary analyst:** Tony FEI
**Secondary analyst:** Jolin LIU
**Third analyst:** N/A
**Created by:** Tony FEI
**Last user:** Keith CHAN
**Management Approval:**No
**Company List File?:**Yes
**Publication time:**
**Related Companies:**
CCJ US Equity
**Free text:**
(i) Cameco released an update on its North Saskatchewan operation, as spring flooding brought down a bridge on a primary logistics route to its flagship McArthur River mine. (ii) The incident could potentially drag Cameco’s annual production in the short term, but more importantly reminds us of the fragility of the uranium supply chain. In the short term, Cameco may need to purchase or loan more materials to meet their contract obligations if the highway remains closed for longer term. (iii) But on the longer run, we expect utilities to better realize the importance of securing and diversifying supply and start contracting more proactively, which will eventually benefit Cameco. Maintain BUY rating and US$150 TP. 卡梅科 - 道路中断再次提醒供应链脆弱；维持买入评级 (i) 卡梅科公告了其萨斯喀彻温省北部运营情况更新，春季洪水冲垮了一座通往麦克阿瑟河铀矿交通要道上的桥梁。 (ii) 短期来看，这次事件可能影响卡梅科的年度产量，但更重要的是再次提醒了天然铀产业链的脆弱性。 (iii) 如果情况持续，卡梅科可能需要从市场上购买或借贷天然铀来完成供货，但长期来看，电力企业应认识到供应的脆弱，而加快供应的多元化并更加积极地进行采购，最终仍会令卡梅科受益。我们维持卡梅科的买入评级和150美元目标价。`;

const DISCLAIMERS = {
  research: `This e-mail and its attachments are intended solely for the use of the individual to whom it is addressed.  If you are not the intended recipient of this e-mail and its attachments, you must take no action based upon them, nor must you copy or show them to anyone. Please contact the sender if you believe you have received this e-mail in error.
Please read carefully the disclaimer contained in the attached research report.  Please note that the information contained in any research report does not constitute an offer to sell securities or the solicitation of an offer to buy, or recommendation for investment in, any securities within Hong Kong or any other jurisdiction.  The information in any research report is not intended as financial advice.  Moreover, none of the research reports is intended as a prospectus within the meaning of the applicable laws of any jurisdiction and none of the research reports is directed to any person in any country in which the distribution of such research report is unlawful.  Any research report provides general information only.  The information and opinions in each research report constitute a judgment as at the date indicated and are subject to change without notice.  The information may therefore not be accurate or current.  The information and opinions contained in the research reports have been complied or arrived at from sources believed to be reliable in good faith, but no representation or warranty, express or implied, is made by BOCI Research Limited as to their accuracy, completeness or correctness and BOCI Research Limited does not warrant that information is up to date.   Moreover, you should be aware of the fact that investments in undertakings, securities or other financial instruments involve risks.  Past result do not guarantee future performance.`,
  important: `Important : The information contained in this e-mail and any attachment thereof is intended only for use by the individual or entity to which it is addressed and is confidential and may be legally privileged and/or otherwise protected from disclosure. Any unauthorized use, copying, dissemination or any other action taken or omitted to be taken in reliance upon this information is prohibited. If you are not the intended recipient(s) of this e-mail, please delete it and all copies from your system and notify the sender immediately by return e-mail. BOC International Holdings Limited, and each of its affiliates and subsidiaries ("BOCI Group") reserve the right to monitor all e-mail communications through its networks. Any views expressed in this e-mail are those of the individual sender except where the e-mail states otherwise and the sender is authorized to state them to be the views of any such entity of the BOCI Group. Unless otherwise stated, any pricing information given in this e-mail is indicative only, is subject to change and does not constitute an offer to deal at any price quoted. Subject to applicable law or regulation, any reference to the terms of any executed transaction should only be treated as preliminary and subject to formal written confirmation. Internet communications cannot be guaranteed to be timely, secure, error or virus-free. The sender does not accept liability for any errors or omissions.`
};

const state = {
  generatedHtml: "",
  generatedText: "",
  titleWasAutoGenerated: false
};

const elements = {
  appVersion: document.querySelector("#appVersion"),
  sourceInput: document.querySelector("#sourceInput"),
  titleInput: document.querySelector("#titleInput"),
  reportUrl: document.querySelector("#reportUrl"),
  websiteUrl: document.querySelector("#websiteUrl"),
  emailDirectory: document.querySelector("#emailDirectory"),
  emailPreview: document.querySelector("#emailPreview"),
  statusMessage: document.querySelector("#statusMessage"),
  generateButton: document.querySelector("#generateButton"),
  copyHtmlButton: document.querySelector("#copyHtmlButton"),
  copyTextButton: document.querySelector("#copyTextButton"),
  sampleButton: document.querySelector("#sampleButton"),
  emptyState: document.querySelector("#emptyState")
};

const EMAIL_STYLES = {
  title: " font-size:24pt;color:blue",
  analyst: " font-size:12pt",
  analystLink: " font-size:12pt;color:blue",
  englishBody: " font-size:10pt;font-family:Palatino Linotype",
  chineseBody: " font-size:10pt;font-family:宋体",
  chineseTitle: " font-size:14pt;color:#9f000f;font-family:宋体",
  chineseTitleLatin: " font-size:14pt;color:#9f000f;font-family:Arial Black",
  disclaimerSmall: " font-size:9pt;font-family:Times New Roman",
  disclaimerBody: " font-size:12pt;font-family:Times New Roman",
  normal10: " font-size:10pt"
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function stripMarkdown(value = "") {
  return value.replace(/\*\*/g, "").trim();
}

function normalizeSpaces(value = "") {
  return value
    .replace(/[\u00a0\u2007\u202f]/g, " ")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const REPORT_FIELD_LABELS = [
  "Is this report part of Sector Report?",
  "Report Type",
  "Report Reason",
  "Main entity",
  "Title",
  "Document ID",
  "Primary analyst",
  "Secondary analyst",
  "Third analyst",
  "Created by",
  "Last user",
  "Management Approval",
  "Company List File?",
  "Publication time",
  "Related Companies",
  "Free text"
];

function escapeRegExp(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getField(source, label) {
  const normalizedSource = source
    .replace(/\r\n?/g, "\n")
    .replace(/[\u00a0\u2007\u202f]/g, " ")
    .replace(/[\u200b-\u200d\ufeff]/g, "");
  const escapedLabel = escapeRegExp(label);
  const linePattern = new RegExp(
    `^[\\s>*•-]*(?:\\*\\*)?${escapedLabel}\\s*[:：]\\s*(?:\\*\\*)?\\s*(.*?)\\s*$`,
    "i"
  );

  const followingLabels = REPORT_FIELD_LABELS
    .filter((fieldLabel) => fieldLabel.toLowerCase() !== label.toLowerCase())
    .map(escapeRegExp)
    .join("|");
  const flattenedPattern = new RegExp(
    `(?:\\*\\*)?${escapedLabel}\\s*[:：]\\s*(?:\\*\\*)?\\s*(.*?)(?=\\s*(?:\\*\\*)?(?:${followingLabels})\\s*[:：]|$)`,
    "is"
  );
  const flattenedMatch = normalizedSource.match(flattenedPattern);
  if (flattenedMatch) return stripMarkdown(flattenedMatch[1]);

  for (const line of normalizedSource.split("\n")) {
    const match = line.match(linePattern);
    if (match) return stripMarkdown(match[1]);
  }

  return "";
}

function parseEmailDirectory() {
  const parsed = JSON.parse(elements.emailDirectory.value);
  return Object.entries(parsed).reduce((directory, [name, record]) => {
    if (typeof record === "string") {
      directory[name] = { email: record, zhName: "" };
      return directory;
    }

    directory[name] = {
      email: record.email || "",
      zhName: record.zhName || ""
    };
    return directory;
  }, {});
}

function getAnalysts(source) {
  return ["Primary analyst", "Secondary analyst", "Third analyst"]
    .map((label) => getField(source, label))
    .filter((name) => name && !/^n\/?a$/i.test(name));
}

function getRelatedTicker(source) {
  const match = source.match(/\*\*Related Companies:\*\*\s*\n([^\n]+)/i);
  if (!match) return "";
  return normalizeSpaces(match[1]).replace(/\s+Equity$/i, "").replace(/\s+/g, ".");
}

function splitFreeText(source) {
  const match = source.match(/(?:\*\*)?Free\s*text\s*:\s*(?:\*\*)?\s*([\s\S]*)/i);
  const freeText = normalizeSpaces(match ? match[1] : "");
  const chineseStart = freeText.search(/[\u3400-\u9fff]/);

  if (chineseStart < 0) {
    return { englishText: freeText, chineseTitle: "", chineseText: "" };
  }

  const englishText = normalizeSpaces(freeText.slice(0, chineseStart));
  const chineseBlock = normalizeSpaces(freeText.slice(chineseStart));
  const firstChineseBullet = chineseBlock.search(/[（(\[【]\s*(?:i|ⅰ)\s*[）)\]】]/i);

  if (firstChineseBullet < 0) {
    return { englishText, chineseTitle: chineseBlock, chineseText: "" };
  }

  return {
    englishText,
    chineseTitle: normalizeSpaces(chineseBlock.slice(0, firstChineseBullet)),
    chineseText: normalizeSpaces(chineseBlock.slice(firstChineseBullet))
  };
}

function normaliseMarker(marker) {
  const unicodeMarkers = { "ⅰ": "i", "ⅱ": "ii", "ⅲ": "iii", "ⅳ": "iv", "ⅴ": "v" };
  const cleaned = marker.toLowerCase().replace(/\s+/g, "");
  return unicodeMarkers[cleaned] || cleaned;
}

function splitBullets(text) {
  if (!text) return [];

  const markerPattern = /[（(\[【]\s*(i{1,3}|iv|v|ⅰ|ⅱ|ⅲ|ⅳ|ⅴ)\s*[）)\]】]\s*[.:：-]?/gi;
  const matches = [...text.matchAll(markerPattern)];

  if (!matches.length) {
    return normalizeSpaces(text) ? [{ marker: "i", body: normalizeSpaces(text) }] : [];
  }

  return matches.map((match, index) => {
    const nextMatch = matches[index + 1];
    const bodyStart = match.index + match[0].length;
    const bodyEnd = nextMatch ? nextMatch.index : text.length;

    return {
      marker: normaliseMarker(match[1]),
      body: normalizeSpaces(text.slice(bodyStart, bodyEnd))
    };
  }).filter((bullet) => bullet.body);
}

function makeMailHref(email, subject) {
  return escapeHtml(`mailto:${email}`);
}

function makeEnglishMailLink(name, directory, subject) {
  const record = directory[name] || {};
  const email = record.email || "";
  const safeName = escapeHtml(name);

  if (!email) return `<span style="${EMAIL_STYLES.analyst}">${safeName}</span>`;

  return `<a href="${makeMailHref(email, subject)}"><span style="${EMAIL_STYLES.analystLink}"><u>${safeName}</u></span></a>`;
}

function makeChineseMailLink(englishName, directory, subject) {
  const record = directory[englishName] || {};
  const zhName = record.zhName || englishName;
  const email = record.email || "";
  const safeName = escapeHtml(zhName);

  if (!email) return `<span style="${EMAIL_STYLES.chineseBody}"><b>${safeName}</b></span>`;

  return `<a href="${makeMailHref(email, subject)}"><span style=" font-size:10pt;color:blue;font-family:宋体"><b><u>${safeName}</u></b></span></a>`;
}

function emphasizeEnglish(text) {
  return escapeHtml(text).replace(/\bBUY\b/g, "<i>BUY</i>");
}

function emphasizeChinese(text) {
  return escapeHtml(text).replace(/买入/g, "<i>买入</i>");
}

function isNonAscii(char) {
  return /[^\x00-\x7F]/.test(char);
}

function renderMixedFontRuns(text, nonAsciiStyle, asciiStyle) {
  if (!text) return "";

  const runs = [];
  let current = "";
  let currentIsNonAscii = isNonAscii(text[0]);

  for (const char of text) {
    const charIsNonAscii = isNonAscii(char);
    if (charIsNonAscii !== currentIsNonAscii && current) {
      runs.push({ text: current, nonAscii: currentIsNonAscii });
      current = "";
    }
    current += char;
    currentIsNonAscii = charIsNonAscii;
  }

  if (current) runs.push({ text: current, nonAscii: currentIsNonAscii });

  return runs
    .map((run) => {
      const style = run.nonAscii ? nonAsciiStyle : asciiStyle;
      const content = run.nonAscii ? emphasizeChinese(run.text) : emphasizeEnglish(run.text);
      return `<span style="${style}"><b>${content}</b></span>`;
    })
    .join("");
}

function buildEnglishTitle(companyName, chineseTitle) {
  const reportReason = chineseTitle.includes("道路中断") || chineseTitle.includes("供应链")
    ? "Disruption in logistics reminds supply chain fragility; Retain BUY"
    : "Company update; Retain BUY";
  const [firstWord, ...rest] = companyName.split(/\s+/);
  return {
    companyLead: firstWord || companyName,
    remainder: rest.join(" "),
    reportReason
  };
}

function normalizeChineseTitle(title) {
  if (!title) return "";
  return title
    .replace(/\s*-\s*/, "–")
    .replace(/维持买入评级(?!\()/, "维持买入评级(买入)");
}

function renderResearchDisclaimer() {
  const [firstSentence, rest = ""] = DISCLAIMERS.research.split("\n");
  const restHtml = escapeHtml(rest).replace(
    "Please read carefully the disclaimer contained in the attached research report",
    "<b>Please read carefully the disclaimer contained in the attached research report</b>"
  );

  return `
    <span style="${EMAIL_STYLES.disclaimerSmall}"><br>${escapeHtml(firstSentence)}</span>
    <div>
      <span style="${EMAIL_STYLES.disclaimerBody}">${restHtml}</span><br>
      <span style="${EMAIL_STYLES.normal10}">*******************************************************************************************</span><br>
    </div>
  `;
}

function buildEmailHtml(report) {
  const directory = parseEmailDirectory();
  const reportSubject = `${report.companyName} research report`;
  const titleParts = buildEnglishTitle(report.companyName, report.chineseTitle);
  const englishAnalysts = report.analysts
    .map((name) => makeEnglishMailLink(name, directory, reportSubject))
    .join(`<span style="${EMAIL_STYLES.analyst}"><u>; </u></span>`);
  const chineseAnalysts = report.analysts
    .map((name) => makeChineseMailLink(name, directory, reportSubject))
    .join(`<span style="${EMAIL_STYLES.englishBody}"><b>/</b></span>`);
  const reportUrl = elements.reportUrl.value.trim();
  const websiteUrl = elements.websiteUrl.value.trim();
  const ticker = report.ticker ? ` *${report.ticker}` : "";
  const automaticTitle = titleParts.remainder
    ? `${titleParts.companyLead} ${titleParts.remainder} – ${titleParts.reportReason} (BUY)${ticker}`
    : `${report.companyName} – ${titleParts.reportReason} (BUY)${ticker}`;
  const englishTitle = report.englishTitle || automaticTitle;
  const chineseTitle = `${normalizeChineseTitle(report.chineseTitle)}${ticker}`;

  const englishBulletHtml = report.englishBullets
    .map((bullet) => `<p style="margin:0 0 12pt 0"><span style="${EMAIL_STYLES.englishBody}"><b>(${escapeHtml(bullet.marker)}) ${emphasizeEnglish(bullet.body)}</b></span></p>`)
    .join("\n");
  const chineseBulletHtml = report.chineseBullets
    .map((bullet) => `<p style="margin:0 0 8pt 0"><span style="${EMAIL_STYLES.englishBody}"><b>(${escapeHtml(bullet.marker)}) </b></span>${renderMixedFontRuns(bullet.body, EMAIL_STYLES.chineseBody, EMAIL_STYLES.englishBody)}</p>`)
    .join("\n");
  const reportLink = reportUrl
    ? `<a href="${escapeHtml(reportUrl)}"><span style="${EMAIL_STYLES.analystLink}"><u>Click here to read the report.</u></span></a><span style="${EMAIL_STYLES.analyst}"> (This link will be valid for the next 365 days)</span><br>`
    : `<span style="${EMAIL_STYLES.analyst}"><b>Click here to read the report.</b> (add report link)</span><br>`;
  const websiteLink = websiteUrl
    ? `<span style="${EMAIL_STYLES.analyst}">For more BOCI reports, please visit the </span><a href="${escapeHtml(websiteUrl)}"><span style="${EMAIL_STYLES.analystLink}"><u>BOCI Research website</u></span></a><span style="${EMAIL_STYLES.analyst}">.</span><br>`
    : `<span style="${EMAIL_STYLES.analyst}">For more BOCI reports, please visit the BOCI Research website.</span><br>`;

  return `
    <span class="report-title" style="${EMAIL_STYLES.title}"><b><u>${escapeHtml(englishTitle)}</u></b></span><span style="${EMAIL_STYLES.analyst}"> </span><br>
    <span class="analysts">${englishAnalysts}</span>
    ${englishBulletHtml}
    <p class="zh-title" style="margin:20pt 0 10pt 0">${renderMixedFontRuns(chineseTitle, EMAIL_STYLES.chineseTitle, EMAIL_STYLES.chineseTitleLatin)}</p>
    <p class="analysts" style="margin:0 0 10pt 0">${chineseAnalysts}</p>
    ${chineseBulletHtml}
    <div class="links">${reportLink}${websiteLink}</div>
    <span class="company-signature" style="${EMAIL_STYLES.analyst}"><b>BOCI Research Limited</b></span><br>
    <span class="disclaimer-rule" style="${EMAIL_STYLES.analyst}">*******************************************************************************************</span>
    ${renderResearchDisclaimer()}
    <br><br><br><br>
    <span class="disclaimer" style="${EMAIL_STYLES.normal10}">${escapeHtml(DISCLAIMERS.important)}</span><br>
  `;
}

function htmlToText(html) {
  const temporary = document.createElement("div");
  temporary.innerHTML = html;
  return temporary.innerText.replace(/\n{3,}/g, "\n\n").trim();
}

function parseReport() {
  const source = elements.sourceInput.value.trim();
  const companyName = getField(source, "Main entity") || getField(source, "Title") || "Company";
  const analysts = getAnalysts(source);
  const ticker = getRelatedTicker(source);
  const freeText = splitFreeText(source);

  return {
    companyName,
    analysts,
    ticker,
    chineseTitle: freeText.chineseTitle,
    englishBullets: splitBullets(freeText.englishText),
    chineseBullets: splitBullets(freeText.chineseText)
  };
}

function setStatus(message, isWarning = false) {
  elements.statusMessage.textContent = message;
  elements.statusMessage.classList.toggle("warning", isWarning);
}

function renderEmptyState() {
  elements.emailPreview.replaceChildren(elements.emptyState.content.cloneNode(true));
  state.generatedHtml = "";
  state.generatedText = "";
}

function generateEmail() {
  try {
    const report = parseReport();
    const warnings = [];

    if (!elements.sourceInput.value.trim()) {
      renderEmptyState();
      setStatus("Paste the original notification first.", true);
      return;
    }

    const titleParts = buildEnglishTitle(report.companyName, report.chineseTitle);
    const ticker = report.ticker ? ` *${report.ticker}` : "";
    const automaticTitle = titleParts.remainder
      ? `${titleParts.companyLead} ${titleParts.remainder} – ${titleParts.reportReason} (BUY)${ticker}`
      : `${report.companyName} – ${titleParts.reportReason} (BUY)${ticker}`;

    if (!elements.titleInput.value.trim() || state.titleWasAutoGenerated) {
      elements.titleInput.value = automaticTitle;
      state.titleWasAutoGenerated = true;
    }
    report.englishTitle = elements.titleInput.value.trim();

    if (!report.analysts.length) warnings.push("No analysts found");
    if (!report.englishBullets.length) warnings.push("No English bullets found");
    if (!report.chineseBullets.length) warnings.push("No Chinese bullets found");
    if (!elements.reportUrl.value.trim()) warnings.push("Report link is blank");

    const html = buildEmailHtml(report);
    elements.emailPreview.innerHTML = html;
    state.generatedHtml = html.trim();
    state.generatedText = htmlToText(html);

    if (warnings.length) {
      setStatus(`Generated with notes: ${warnings.join(", ")}.`, true);
      return;
    }

    setStatus("Generated email-ready output.");
  } catch (error) {
    setStatus(`Could not generate: ${error.message}`, true);
  }
}

function fallbackCopy(value) {
  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.append(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
}

function buildOutlookClipboardHtml(html) {
  return `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#ffffff;color:#000000;font-family:Arial,Helvetica,sans-serif"><div style="background:#ffffff;color:#000000;font-family:Arial,Helvetica,sans-serif">${html}</div></body></html>`;
}

function copyRenderedHtml(html) {
  const copyContainer = document.createElement("div");
  copyContainer.setAttribute("contenteditable", "true");
  copyContainer.setAttribute("aria-hidden", "true");
  copyContainer.style.position = "fixed";
  copyContainer.style.left = "-10000px";
  copyContainer.style.top = "0";
  copyContainer.style.width = "760px";
  copyContainer.style.background = "#ffffff";
  copyContainer.innerHTML = html;
  document.body.append(copyContainer);

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(copyContainer);
  selection.removeAllRanges();
  selection.addRange(range);

  const copied = document.execCommand("copy");
  selection.removeAllRanges();
  copyContainer.remove();
  return copied;
}

async function copyHtmlToClipboard() {
  if (!state.generatedHtml) {
    setStatus("Generate the email first.", true);
    return;
  }

  const outlookHtml = buildOutlookClipboardHtml(state.generatedHtml);

  if (window.ClipboardItem && navigator.clipboard?.write) {
    try {
      const htmlBlob = new Blob([outlookHtml], { type: "text/html" });
      const textBlob = new Blob([state.generatedText], { type: "text/plain" });
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob
        })
      ]);
      setStatus("Rich email copied for Outlook.");
      return;
    } catch (error) {
      // Continue to the rendered-selection fallback used by older browsers.
    }
  }

  try {
    if (copyRenderedHtml(state.generatedHtml)) {
      setStatus("Rich email copied for Outlook.");
      return;
    }
  } catch (error) {
    // Continue to the plain-text fallback when browser clipboard access is blocked.
  }

  fallbackCopy(state.generatedText);
  setStatus("Plain text copied because rich clipboard access was blocked.", true);
}

async function copyTextToClipboard() {
  const value = state.generatedText;
  if (!value) {
    setStatus("Generate the email first.", true);
    return;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      fallbackCopy(value);
    }
    setStatus("Text copied.");
  } catch (error) {
    fallbackCopy(value);
    setStatus("Text copied with fallback.");
  }
}

function initialize() {
  elements.appVersion.textContent = `v${APP_VERSION}`;
  elements.emailDirectory.value = JSON.stringify(DEFAULT_EMAIL_DIRECTORY, null, 2);
  renderEmptyState();

  elements.generateButton.addEventListener("click", generateEmail);
  elements.copyHtmlButton.addEventListener("click", copyHtmlToClipboard);
  elements.copyTextButton.addEventListener("click", copyTextToClipboard);
  elements.titleInput.addEventListener("input", () => {
    state.titleWasAutoGenerated = false;
  });
  elements.sourceInput.addEventListener("input", () => {
    if (state.titleWasAutoGenerated) elements.titleInput.value = "";
  });
  elements.sampleButton.addEventListener("click", () => {
    elements.sourceInput.value = SAMPLE_INPUT;
    elements.titleInput.value = "";
    state.titleWasAutoGenerated = false;
    generateEmail();
  });
}

initialize();
