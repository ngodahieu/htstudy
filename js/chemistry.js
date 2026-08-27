/*==================================================
            H&T STUDY - CHEMISTRY.JS (PRO MAX)
    MODULE XỬ LÝ ĐỊNH DẠNG HÓA HỌC VÀ TOÁN HỌC CHUẨN
==================================================*/

// 1. Bảng ánh xạ chỉ số dưới (Chỉ giữ lại các biến chỉ số hữu cơ chuẩn: n, m, x, y, z, k, p, t)
const SUB_MAP = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
    "n": "ₙ", "m": "ₘ", "x": "ₓ", "y": "ᵧ", "z": "z",
    "k": "ₖ", "p": "ₚ", "t": "ₜ"
};

// 2. Bảng ánh xạ điện tích / chỉ số trên (Superscripts)
const SUPER_MAP = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻"
};

const toSubscript = (str) => str.split("").map(c => SUB_MAP[c] || c).join("");
const toSuperscript = (str) => str.split("").map(c => SUPER_MAP[c] || c).join("");

// Danh sách bảo vệ các nguyên tố 2 chữ cái (Không bao giờ hạ nhỏ chữ cái thứ 2)
const TWO_LETTER_ELEMENTS = "Na|Ca|Ba|Mg|Al|Fe|Cu|Ag|Pb|Hg|Br|Cl|Si|Cr|Ni|Li|Be|He|Ne|Ar|Kr|Xe|Rb|Sr|Cs|Pt|Au|Cd|Co|Bi|Sb|As|Se|Te|Zn|Mn|Sn|Rn|In";

/**
 * Định dạng công thức hóa học tự động (Vô cơ & Hữu cơ)
 * @param {string} text 
 * @returns {string}
 */
export function formatChemicalFormula(text) {
    if (!text) return "";

    let formatted = String(text);

    // Bước 1: Chuyển đổi toán tử so sánh & Mũi tên phản ứng
    formatted = formatted
        .replace(/<[-=]>|<=>/g, "⇌")
        .replace(/[-=]>[->]?/g, "→")
        .replace(/>=/g, "≥")
        .replace(/<=/g, "≤");

    // Bước 2: Tự động chuẩn hóa ký hiệu nhiệt độ độ C (VD: 70oC, 70 oC, 70degC -> 70°C)
    formatted = formatted.replace(/(\d+)\s*(?:[oO]|°|\^o)\s*C\b/g, "$1°C");

    // Bước 3: Chuyển dấu chấm tinh thể ngậm nước (VD: CuSO4.5H2O -> CuSO₄·5H₂O)
    // Ràng buộc nghiêm ngặt: Phía trước là chữ hoa/số và phía sau là số hệ số (tránh dính vào dấu chấm câu văn bản)
    formatted = formatted.replace(/([A-Z0-9\)\}\]])\s*[\.\*]\s*(\d+\s*[A-Z])/g, "$1·$2");

    // Bước 4: Xử lý số mũ / điện tích dạng explicit '^' (VD: Fe^3+, SO4^2-)
    formatted = formatted.replace(/\^([0-9\+\-]+)/g, (_, match) => toSuperscript(match));

    // Bước 5: Xử lý điện tích ion viết liền (VD: Fe3+ -> Fe³⁺, SO42- -> SO₄²⁻, Na+ -> Na⁺)
    const CHARGE_TARGET = `(?:${TWO_LETTER_ELEMENTS}|[A-Z]|[\)\}])`;
    const chargeRegex = new RegExp(`(${CHARGE_TARGET})(\\d*[\\+\\-])(?![0-9a-zA-Z\\+\\-])`, "g");
    formatted = formatted.replace(chargeRegex, (_, elem, charge) => elem + toSuperscript(charge));

    // Bước 6: Hạ chỉ số dưới cho SỐ THUỒNG trong công thức (VD: CH3COOH -> CH₃COOH, C2H5 -> C₂H₅, NaOH -> NaOH)
    const ELEM_OR_BRACKET = `(?:${TWO_LETTER_ELEMENTS}|[A-Z]|[\)\}])`;
    const numSubRegex = new RegExp(`(${ELEM_OR_BRACKET})(\\d+)`, "g");
    formatted = formatted.replace(numSubRegex, (_, elem, num) => elem + toSubscript(num));

    // Bước 7: Hạ chỉ số dưới cho BIỂU THỨC HỮU CƠ (VD: CnH2nO, CnH2n+2, CxHyOz)
    const ORGANIC_ELEM = `(?:C|H|O|N|R|X|[\)\}])`;
    const ORGANIC_INDEX = `(?:\\d*[nmxyzkpt](?:[\\+\\-]\\d+)?|\\d+)`;
    const organicSubRegex = new RegExp(`(${ORGANIC_ELEM})(${ORGANIC_INDEX})(?![a-z])`, "g");

    formatted = formatted.replace(organicSubRegex, (_, elem, sub) => elem + toSubscript(sub));

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
