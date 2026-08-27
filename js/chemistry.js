/*==================================================
            H&T STUDY - CHEMISTRY.JS
    MODULE XỬ LÝ ĐỊNH DẠNG HÓA HỌC VÀ TOÁN HỌC (FIXED ALL)
==================================================*/

// 1. Bảng ánh xạ chỉ số dưới (Subscripts) cho cả số và biến hữu cơ
const SUB_MAP = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
    "k": "ₖ", "m": "ₘ", "n": "ₙ", "p": "ₚ", "t": "ₜ",
    "x": "ₓ", "y": "ᵧ", "z": "z", "a": "ₐ", "b": "♭"
};

// 2. Bảng ánh xạ điện tích / chỉ số trên (Superscripts)
const SUPER_MAP = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻"
};

const toSubscript = (str) => str.split("").map(c => SUB_MAP[c] || c).join("");
const toSuperscript = (str) => str.split("").map(c => SUPER_MAP[c] || c).join("");

// Danh sách các nguyên tố 2 chữ cái để bảo vệ không bị nuốt chữ (VD: Na, Ca, Fe, Cl...)
const TWO_LETTER = "Na|Ca|Ba|Mg|Al|Fe|Cu|Ag|Pb|Hg|Br|Cl|Si|Cr|Ni|Li|Be|He|Ne|Ar|Kr|Xe|Rb|Sr|Cs|Pt|Au|Cd|Co|Bi|Sb|As|Se|Te|Zn|Mn|Sn|Rn|In";

/**
 * Định dạng công thức hóa học tự động (Vô cơ & Hữu cơ)
 */
export function formatChemicalFormula(text) {
    if (!text) return "";

    let formatted = String(text);

    // 1. Chuyển đổi mũi tên phản ứng và dấu so sánh (->, =>, <=>, >=, <=)
    formatted = formatted
        .replace(/<[-=]>|<=>/g, "⇌")
        .replace(/[-=]>[->]?/g, "→")
        .replace(/>=/g, "≥")
        .replace(/<=/g, "≤");

    // 2. Chuyển dấu chấm tinh thể ngậm nước (VD: CuSO4.5H2O -> CuSO₄·5H₂O)
    formatted = formatted.replace(/([A-Za-z0-9\)\}\]])\s*[\.\*]\s*(\d*\s*[A-Z])/g, "$1·$2");

    // 3. Xử lý số mũ / điện tích dạng explicit '^' (VD: Fe^3+, SO4^2-)
    formatted = formatted.replace(/\^([0-9\+\-]+)/g, (_, match) => toSuperscript(match));

    // 4. Xử lý điện tích ion viết liền (VD: Fe3+ -> Fe³⁺, SO42- -> SO₄²⁻, Na+ -> Na⁺)
    const chargeRegex = new RegExp(`(${TWO_LETTER}|[A-Z]|[\)\}])(\\d*[\\+\\-])(?![0-9a-zA-Z\\+\\-])`, "g");
    formatted = formatted.replace(chargeRegex, (_, elem, charge) => elem + toSuperscript(charge));

    // 5. Định dạng chỉ số dưới (Ưu tiên khớp toàn bộ biểu thức hữu cơ 2n, 2n+2, 2n-2, n trước rồi mới đến số đơn)
    const ELEM_REGEX = `(?:${TWO_LETTER}|[A-Z]|[\)\}])`;
    const SUB_EXPR = `(?:\\d*[a-z]+(?:[\\+\\-]\\d+)?|\\d+)`;
    const subRegex = new RegExp(`(${ELEM_REGEX})(${SUB_EXPR})`, "g");

    formatted = formatted.replace(subRegex, (_, elem, sub) => {
        return elem + toSubscript(sub);
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
