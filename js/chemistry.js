// ==========================================
// H&T STUDY - CHEMISTRY FORMATTER
// ==========================================

// Chuyển số thường thành số dưới
const chemistrySubscripts = {
    "0": "₀",
    "1": "₁",
    "2": "₂",
    "3": "₃",
    "4": "₄",
    "5": "₅",
    "6": "₆",
    "7": "₇",
    "8": "₈",
    "9": "₉"
};


// ==========================================
// H2SO4 → H₂SO₄
// ==========================================

export function formatChemicalFormula(text) {

    if (!text) return "";

    return text.replace(
        /([A-Za-z\)])(\d+)/g,
        function(match, element, numbers) {

            const converted = numbers
                .split("")
                .map(number => chemistrySubscripts[number] || number)
                .join("");

            return element + converted;
        }
    );
}


// ==========================================
// FORMAT TOÀN BỘ TEXT
// ==========================================

export function formatChemistryText(text) {

    if (!text) return "";

    return formatChemicalFormula(text);

}
