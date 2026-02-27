// Magnum Calculator Logic
const formulaDisplay = document.getElementById('formula-display');
const mainDisplay = document.getElementById('main-display');
const stepPanel = document.getElementById('step-panel');
const stepsContent = document.getElementById('steps-content');
const controls = document.getElementById('controls');

let currentExpression = '';
let currentMode = 'standard'; // standard, step, minimal
let lastResult = null;

// Mode Switching
document.getElementById('mode-standard').addEventListener('click', () => switchMode('standard'));
document.getElementById('mode-step').addEventListener('click', () => switchMode('step'));
document.getElementById('mode-minimal').addEventListener('click', () => switchMode('minimal'));

function switchMode(mode) {
    currentMode = mode;
    
    // UI Classes
    document.querySelectorAll('.mode-selector button').forEach(b => b.classList.remove('active'));
    document.getElementById(`mode-${mode}`).classList.add('active');
    
    document.body.className = `theme-dark mode-${mode}-active`;
    
    // Toggle Visibility
    stepPanel.classList.toggle('hidden', mode !== 'step' || !stepsContent.innerHTML);
    
    // If switching to minimal, we might want to just show the last result
    if (mode === 'minimal') {
        const result = lastResult !== null ? lastResult : '0';
        mainDisplay.textContent = result;
    }
}

// Button Handling
controls.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const val = btn.dataset.val;
    const action = btn.id;

    if (action === 'clear') {
        resetCalculator();
    } else if (action === 'backspace') {
        backspace();
    } else if (action === 'equals') {
        calculate();
    } else if (val) {
        appendToExpression(val);
    }
});

// Key Handling
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9' || ['+', '-', '*', '/', '(', ')', '.', '%', '^'].includes(e.key)) {
        appendToExpression(e.key);
    } else if (e.key === 'Enter') {
        calculate();
    } else if (e.key === 'Backspace') {
        backspace();
    } else if (e.key === 'Escape') {
        resetCalculator();
    }
});

function appendToExpression(val) {
    // If we just got a result and start typing a number, clear first
    if (lastResult !== null && !isNaN(val)) {
        currentExpression = '';
        lastResult = null;
    }
    
    // Format operators for humans but keep valid for mathjs
    currentExpression += val;
    updateDisplay();
}

function backspace() {
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
}

function resetCalculator() {
    currentExpression = '';
    lastResult = null;
    formulaDisplay.textContent = '';
    mainDisplay.textContent = '0';
    stepsContent.innerHTML = '';
    stepPanel.classList.add('hidden');
}

function updateDisplay() {
    formulaDisplay.textContent = currentExpression || '';
    if (currentExpression === '') {
        mainDisplay.textContent = '0';
    }
}

function calculate() {
    if (!currentExpression) return;

    try {
        let expression = currentExpression;
        
        // Handle special functions like derivative
        // Users might type derivative(x^2) which math.js needs as derivative('x^2', 'x')
        if (expression.includes('derivative(')) {
            expression = processCalculus(expression);
        }

        const result = math.evaluate(expression);
        
        // Format result: up to 4 decimal places
        const formattedResult = typeof result === 'number' 
            ? math.format(result, { precision: 14, notation: 'fixed' }).replace(/\.?0+$/, '') 
            : result.toString();
        
        // Final precision check (4 decimals as per user rule)
        let finalResult = formattedResult;
        if (!isNaN(formattedResult) && formattedResult.includes('.')) {
            const parts = formattedResult.split('.');
            if (parts[1].length > 4) {
                finalResult = parseFloat(formattedResult).toFixed(4);
            }
        }

        // Generate steps if in Step mode
        if (currentMode === 'step') {
            generateSteps(currentExpression, finalResult);
        }

        formulaDisplay.textContent = currentExpression + ' =';
        mainDisplay.textContent = finalResult;
        lastResult = finalResult;
        currentExpression = finalResult.toString();

    } catch (error) {
        console.error(error);
        mainDisplay.textContent = 'Error';
        setTimeout(() => updateDisplay(), 1500);
    }
}

function processCalculus(expr) {
    // Basic regex to find derivative(something) -> math.derivative(something, 'x')
    return expr.replace(/derivative\(([^)]+)\)/g, (match, p1) => {
        return `derivative("${p1}", "x")`;
    });
}

function generateSteps(input, result) {
    stepsContent.innerHTML = '';
    
    const addStep = (title, content) => {
        const div = document.createElement('div');
        div.className = 'step-item';
        div.innerHTML = `<strong>${title}:</strong> <br> ${content}`;
        stepsContent.appendChild(div);
    };

    addStep('Problem', input);
    
    // Formula detection
    if (input.match(/sin|cos|tan/)) {
        addStep('Formula', 'Trigonometric Function Evaluation');
    } else if (input.includes('derivative')) {
        addStep('Logic', 'Calculated the first derivative with respect to x.');
    } else if (input.match(/log|ln/)) {
        addStep('Formula', 'Logarithmic Transformation');
    } else {
        addStep('Order', 'Applied BODMAS/PEMDAS operations.');
    }

    addStep('Resolution', `Final calculated value is ${result}`);
    
    stepPanel.classList.remove('hidden');
}
