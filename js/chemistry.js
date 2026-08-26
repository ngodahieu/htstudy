// ==========================================
// H&T STUDY - CHEMISTRY FORMATTER (ORGANIC UPGRADE)
// ==========================================

// Bảng ánh xạ chỉ số dưới (Subscripts) - Bổ sung ẩn số hữu cơ (n, m, x, y...) và dấu (+, -)
const SUB_MAP = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
    "a": "ₐ", "e": "ₑ", "h": "ₕ", "i": "ᵢ", "j": "ⱼ",
    "k": "ₖ", "l": "ₗ", "m": "ₘ", "n": "ₙ", "o": "ₒ",
    "p": "ₚ", "r": "ᵣ", "s": "ₛ", "t": "ₜ", "u": "ᵤ",
    "v": "ᵥ", "x": "ₓ", "y": "ᵧ", "z": "z"
};

// Bảng ánh xạ điện tích / chỉ số trên (Superscripts)
const SUPER_MAP = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻"
};

const toSubscript = (str) => str.split("").map(c => SUB_MAP[c] || c).join("");
const toSuperscript = (str) => str.split("").map(c => SUPER_MAP[c] || c).join("");

/**
 * Định dạng công thức hóa học (bao gồm công thức tổng quát Hữu cơ: CnH2nO2, CnH2n+2...)
 */
export function formatChemicalFormula(text) {
    if (!text) return "";

    let formatted = text;

    // 1. Chuyển đổi mũi tên phản ứng (->, =>, <=>)
    formatted = formatted
        .replace(/<[-=]>|<=>/g, "⇌")
        .replace(/[-=]>/g, "→");

    // 2. Chuyển dấu chấm tinh thể ngậm nước (VD: CuSO4.5H2O -> CuSO4·5H2O)
    formatted = formatted.replace(/([A-Za-z0-9\)\}\]])\s*[\.\*]\s*(\d*\s*[A-Z])/g, "$1·$2");

    // 3. Xử lý số mũ / điện tích dạng explicit '^' (VD: Fe^3+, SO4^2-)
    formatted = formatted.replace(/\^([0-9\+\-]+)/g, (_, match) => toSuperscript(match));

    // 4. Định dạng chỉ số dưới: Hợp chất thường & Công thức tổng quát Hữu cơ (CnH2nO2, CnH2n+2, CxHyOz, (C6H10O5)n...)
    // Bảo vệ các nguyên tố 2 chữ cái như Zn, Mn, Sn để không nhầm chữ 'n' thành chỉ số dưới
    const subRegex = /(Zn|Mn|Sn|Rn|In|Na|Ca|Ba|Mg|Al|Fe|Cu|Ag|Pb|Hg|Br|Cl|Si|Cr|Ni|Li|Be|He|Ne|Ar|Kr|Xe|Rb|Sr|Cs|Pt|Au|Cd|Co|Bi|Sb|As|Se|Te|[A-Z]|[\)\}\]])(\d*[nmxyabkz](?:[\+\-]\d+)?|\d+(?![\+\-]))/g;

    formatted = formatted.replace(subRegex, (_, elem, sub) => {
        return elem + toSubscript(sub);
    });

    // 5. Tự động chuyển đổi điện tích ion (VD: Fe3+ -> Fe³⁺, SO₄2- -> SO₄²⁻)
    formatted = formatted.replace(/([A-Za-z\)\}\]|[\₀-₉ₙₘₓᵧ])(\d*[\+\-])(?!\w)/g, (_, elem, charge) => {
        return elem + toSuperscript(charge);
    });

    return formatted;
}

export function formatChemistryText(text) {
    if (!text) return "";
    return formatChemicalFormula(text);
}
