/*==================================================
            H&T STUDY - CHEMISTRY.JS
    MODULE XỬ LÝ ĐỊNH DẠNG HÓA HỌC VÀ TOÁN HỌC (FIXED)
==================================================*/

// 1. Bảng ánh xạ chỉ số dưới (Subscripts)
// Chỉ giữ lại các số và các biến chỉ số hữu cơ chuẩn (n, m, x, y, t, k, p)
const SUB_MAP = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
    "k": "ₖ", "m": "ₘ", "n": "ₙ", "p": "ₚ", "t": "ₜ",
    "x": "ₓ", "y": "ᵧ"
};

// 2. Bảng ánh xạ điện tích / chỉ số trên (Superscripts)
const SUPER_MAP = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻"
};

const toSubscript = (str) => str.split("").map(c => SUB_MAP[c] || c).join("");
const toSuperscript = (str) => str.split("").map(c => SUPER_MAP[c] || c).join("");

// Danh sách bảo vệ các nguyên tố 2 chữ cái trong Hóa học THPT
const TWO_LETTER_ELEMENTS = "Zn|Mn|Sn|Rn|In|Na|Ca|Ba|Mg|Al|Fe|Cu|Ag|Pb|Hg|Br|Cl|Si|Cr|Ni|Li|Be|He|Ne|Ar|Kr|Xe|Rb|Sr|Cs|Pt|Au|Cd|Co|Bi|Sb|As|Se|Te";

/**
 * Định dạng công thức hóa học tự động (Vô cơ & Hữu cơ)
 * @param {string} text 
 * @returns {string}
 */
export function formatChemicalFormula(text) {
    if (!text) return "";

    let formatted = String(text);

    // 1. Chuyển đổi mũi tên phản ứng (->, =>, <=>)
    formatted = formatted
        .replace(/<[-=]>|<=>/g, "⇌")
        .replace(/[-=]>[->]?/g, "→");

    // 2. Chuyển dấu chấm tinh thể ngậm nước (VD: CuSO4.5H2O -> CuSO₄·5H₂O)
    formatted = formatted.replace(/([A-Za-z0-9\)\}\]])\s*[\.\*]\s*(\d*\s*[A-Z])/g, "$1·$2");

    // 3. Xử lý số mũ / điện tích dạng explicit '^' (VD: Fe^3+, SO4^2-)
    formatted = formatted.replace(/\^([0-9\+\-]+)/g, (_, match) => toSuperscript(match));

    // 4. Định dạng chỉ số dưới - Có cơ chế bảo vệ nguyên tố 2 chữ cái (Na, Ca, Ba, Fe, Zn...)
    const subRegex = new RegExp(
        `(?:(${TWO_LETTER_ELEMENTS})|(?!(${TWO_LETTER_ELEMENTS})(?![0-9\\+\\-]))([A-Z]|[\)\}]))(\\d+|[nmxyztkp]+(?:[\\+\\-]\\d+)?)(?![0-9a-zA-Z])`,
        "g"
    );

    formatted = formatted.replace(subRegex, (match, elem2, elem1Protect, elem1, sub) => {
        const targetElem = elem2 || elem1;
        if (!targetElem) return match;
        return targetElem + toSubscript(sub);
    });

    // 5. Tự động chuyển đổi điện tích ion khi viết liền (VD: Fe3+ -> Fe³⁺, SO₄2- -> SO₄²⁻)
    formatted = formatted.replace(/([A-Za-z\)\}\]|[\₀-₉ₙₘₓᵧ])(\d*[\+\-])(?!\w)/g, (_, elem, charge) => {
        return elem + toSuperscript(charge);
    });

    return formatted;
}

/**
 * Hàm định dạng văn bản hóa học dùng chung
 */
export function formatChemistryText(value) {
    if (value === null || value === undefined) return "";
    return formatChemicalFormula(value);
}

/**
 * Tự động render KaTeX cho tất cả phần tử chứa ký tự $
 */
export function renderChemistryMath(selector = "#questionContent, .answer-text, .tf-stmt-text, .review-question-body, .opt-text") {
    if (window.katex && document.querySelectorAll) {
        try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el.innerHTML.includes("$")) {
                    el.innerHTML = el.innerHTML.replace(/\$(.*?)\$/g, (match, formula) => {
                        return window.katex.renderToString(formula, { throwOnError: false });
                    });
                }
            });
        } catch (e) {
            console.error("Lỗi render Math/Chemistry KaTeX:", e);
        }
    }
}
