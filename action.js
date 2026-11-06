// Diccionario completo de i18n
const translations = {
    es: {
        appTitle: "Simulador de Préstamos",
        headerTitle: "Simulador de Préstamos",
        headerSubtitle: "Herramienta de Simulación Financiera",
        printReportTitle: "Reporte de Simulación de Préstamo",
        printDateLabel: "Fecha de generación:",
        loanParameters: "Parámetros del Préstamo",
        fixedQuota: "Cuota Fija",
        lblAmount: "Monto del Préstamo",
        lblInterestRate: "Tasa de Interés (%)",
        lblRateType: "Tipo de Tasa",
        optEA: "Efectiva Anual (E.A.)",
        optEM: "Efectiva Mensual (E.M.)",
        lblTerm: "Plazo (Meses)",
        unitMonths: "Meses",
        btnCalculate: "Calcular Tabla",
        cardMonthlyPayment: "Cuota Mensual",
        cardTotalInterest: "Interés Total",
        cardTotalPayable: "Total a Pagar",
        rateLabel: "Tasa:",
        ofPrincipal: "del capital",
        overPayments: "En {n} cuotas mensuales",
        costComposition: "Composición del Pago",
        legendPrincipal: "Capital",
        legendInterest: "Interés",
        tableTitle: "Tabla de Amortización",
        tableSubtitle: "Desglose mensual de amortización de capital e intereses",
        btnPrint: "Imprimir",
        btnPdf: "Exportar PDF",
        thPeriod: "Período",
        thPayment: "Cuota",
        thInterest: "Interés",
        thPrincipal: "Abono Capital",
        thBalance: "Saldo Restante",
        footerText: "Simulador de Préstamos Bancarios © 2026. Todos los derechos reservados.",
        pdfFilename: "Simulacion_Prestamo"
    },
    en: {
        appTitle: "Loan Simulator",
        headerTitle: "Loan Simulator",
        headerSubtitle: "Financial Simulation Tool",
        printReportTitle: "Loan Simulation Report",
        printDateLabel: "Generated on:",
        loanParameters: "Loan Parameters",
        fixedQuota: "Fixed Quota",
        lblAmount: "Loan Amount",
        lblInterestRate: "Interest Rate (%)",
        lblRateType: "Rate Type",
        optEA: "Effective Annual (E.A.)",
        optEM: "Effective Monthly (E.M.)",
        lblTerm: "Term (Months)",
        unitMonths: "Months",
        btnCalculate: "Calculate Schedule",
        cardMonthlyPayment: "Monthly Payment",
        cardTotalInterest: "Total Interest",
        cardTotalPayable: "Total Outlay",
        rateLabel: "Rate:",
        ofPrincipal: "of principal",
        overPayments: "In {n} monthly payments",
        costComposition: "Cost Breakdown",
        legendPrincipal: "Principal",
        legendInterest: "Interest",
        tableTitle: "Amortization Schedule",
        tableSubtitle: "Monthly breakdown of principal and interest payments",
        btnPrint: "Print",
        btnPdf: "Export PDF",
        thPeriod: "Period",
        thPayment: "Payment",
        thInterest: "Interest",
        thPrincipal: "Principal",
        thBalance: "Remaining Balance",
        footerText: "Bank Loan Simulator © 2026. All rights reserved.",
        pdfFilename: "Loan_Simulation"
    }
};

let currentLang = 'es';
let currentScheduleData = [];

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

// Función para cambiar el idioma
function changeLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    document.documentElement.lang = lang;

    // Actualizar botones de selector de idioma
    const btnEs = document.getElementById('btnLangEs');
    const btnEn = document.getElementById('btnLangEn');

    if (lang === 'es') {
        btnEs.className = 'px-2.5 py-1 text-xs font-semibold rounded-md transition duration-150 bg-blue-600 text-white shadow-sm';
        btnEn.className = 'px-2.5 py-1 text-xs font-semibold rounded-md transition duration-150 text-slate-400 hover:text-white';
    } else {
        btnEn.className = 'px-2.5 py-1 text-xs font-semibold rounded-md transition duration-150 bg-blue-600 text-white shadow-sm';
        btnEs.className = 'px-2.5 py-1 text-xs font-semibold rounded-md transition duration-150 text-slate-400 hover:text-white';
    }

    // Traducir nodos estáticos
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Recalcular para refrescar textos dinámicos
    calculateLoan();
}

function calculateLoan() {
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const inputRate = parseFloat(document.getElementById('interestRate').value) || 0;
    const rateType = document.getElementById('rateType').value;
    const term = parseInt(document.getElementById('term').value, 10) || 0;

    if (amount <= 0 || term <= 0) return;

    // 1. Tasa Efectiva Mensual
    let monthlyRate = 0;
    if (rateType === 'EM') {
        monthlyRate = inputRate / 100;
    } else if (rateType === 'EA') {
        monthlyRate = Math.pow(1 + (inputRate / 100), 1 / 12) - 1;
    }

    // 2. Cuota Fija Mensual (Sistema Francés)
    let pmt = 0;
    if (monthlyRate === 0) {
        pmt = amount / term;
    } else {
        pmt = amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    }

    // 3. Cálculo de la Tabla de Amortización
    currentScheduleData = [];
    let balance = amount;
    let totalInterest = 0;

    currentScheduleData.push({
        period: 0,
        payment: 0,
        interest: 0,
        principal: 0,
        balance: balance
    });

    for (let i = 1; i <= term; i++) {
        const interestPayment = balance * monthlyRate;
        let principalPayment = pmt - interestPayment;

        if (i === term) {
            principalPayment = balance;
            balance = 0;
        } else {
            balance -= principalPayment;
        }

        const actualPayment = principalPayment + interestPayment;
        totalInterest += interestPayment;

        currentScheduleData.push({
            period: i,
            payment: actualPayment,
            interest: interestPayment,
            principal: principalPayment,
            balance: Math.max(0, balance)
        });
    }

    const totalPayable = amount + totalInterest;
    const t = translations[currentLang];

    // 4. Actualizar Tarjetas de Resumen
    document.getElementById('cardMonthlyPaymentVal').innerText = currencyFormatter.format(pmt);
    document.getElementById('cardMonthlyRate').innerText = `${t.rateLabel} ${(monthlyRate * 100).toFixed(2)}% E.M.`;

    document.getElementById('cardTotalInterestVal').innerText = currencyFormatter.format(totalInterest);
    document.getElementById('cardInterestRatio').innerText = `${((totalInterest / amount) * 100).toFixed(1)}% ${t.ofPrincipal}`;

    document.getElementById('cardTotalPayableVal').innerText = currencyFormatter.format(totalPayable);
    document.getElementById('cardTermSummary').innerText = t.overPayments.replace('{n}', term);

    // 5. Actualizar Barra Visual de Proporción
    const principalPct = (amount / totalPayable) * 100;
    const interestPct = (totalInterest / totalPayable) * 100;
    document.getElementById('barPrincipal').style.width = `${principalPct}%`;
    document.getElementById('barInterest').style.width = `${interestPct}%`;

    // 6. Renderizar Filas de la Tabla
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('amortizationBody');
    tbody.innerHTML = '';

    currentScheduleData.forEach((row) => {
        const tr = document.createElement('tr');
        tr.className = row.period % 2 === 0 ? 'bg-slate-50/50 hover:bg-slate-100/80 transition' : 'bg-white hover:bg-slate-100/80 transition';

        if (row.period === 0) {
            tr.innerHTML = `
                <td class="py-2.5 px-4 text-center font-bold text-slate-400">0</td>
                <td class="py-2.5 px-4 text-right text-slate-400">-</td>
                <td class="py-2.5 px-4 text-right text-slate-400">-</td>
                <td class="py-2.5 px-4 text-right text-slate-400">-</td>
                <td class="py-2.5 px-4 text-right font-semibold text-slate-900">${currencyFormatter.format(row.balance)}</td>
            `;
        } else {
            tr.innerHTML = `
                <td class="py-2.5 px-4 text-center font-semibold text-slate-500">${row.period}</td>
                <td class="py-2.5 px-4 text-right font-bold text-blue-600">${currencyFormatter.format(row.payment)}</td>
                <td class="py-2.5 px-4 text-right text-amber-600">${currencyFormatter.format(row.interest)}</td>
                <td class="py-2.5 px-4 text-right text-slate-700">${currencyFormatter.format(row.principal)}</td>
                <td class="py-2.5 px-4 text-right text-slate-900">${currencyFormatter.format(row.balance)}</td>
            `;
        }
        tbody.appendChild(tr);
    });
}

// Operación: Imprimir
document.getElementById('btnPrint').addEventListener('click', () => {
    const loc = currentLang === 'es' ? 'es-ES' : 'en-US';
    const dateStr = new Date().toLocaleDateString(loc, { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('printDate').innerText = dateStr;
    window.print();
});

// Operación: Exportar PDF (html2pdf)
document.getElementById('btnPdf').addEventListener('click', () => {
    const element = document.getElementById('exportableArea');
    const tableContainer = document.getElementById('tableContainer');
    
    const originalMaxHeight = tableContainer.style.maxHeight;
    tableContainer.style.maxHeight = 'none';

    const filenameKey = translations[currentLang].pdfFilename;
    const opt = {
        margin:       0.4,
        filename:     `${filenameKey}_${new Date().toISOString().slice(0,10)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        tableContainer.style.maxHeight = originalMaxHeight;
    });
});

// Event Listeners e Inicialización
document.getElementById('loanForm').addEventListener('submit', function (e) {
    e.preventDefault();
    calculateLoan();
});

window.addEventListener('DOMContentLoaded', () => {
    changeLanguage('es');
});