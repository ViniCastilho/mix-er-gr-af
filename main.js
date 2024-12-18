let erRule = document.querySelector('#er-rule');
erRule.onkeyup = function (ev) {
	if (erRule.value === '') {
		erRule.className = '';
		return;
	}
	let isValid = true;
	try {
		('').match(erRule.value);
	} catch {
		isValid = false;
	}
	if (isValid) {
		erRule.className = 'rule-correct';
	} else {
		erRule.className = 'rule-incorrect';
	}
}

let grSymbols = {};
let grEquationParent = document.querySelector('#gr-eq');
let grEquationList = [];
grEquationList.push(
	{
		'left': document.querySelector('#gr-l0'),
		'right': document.querySelector('#gr-r0'),
	}
);
let grAdd = document.querySelector('#gr-add');

grAdd.onclick = function () {
	let leftSide = document.createElement('input');
	leftSide.id = `gr-l${grEquationList.length}`;
	leftSide.className = 'gr-leq';
	leftSide.type = 'text';
	leftSide.placeholder = 'S';
	leftSide.maxLength = 1;
	grEquationParent.appendChild(leftSide);

	let rightSide = document.createElement('input');
	rightSide.id = `gr-r${grEquationList.length}`;
	rightSide.className = 'gr-req';
	rightSide.type = 'text';
	rightSide.placeholder = 'λ';
	grEquationParent.appendChild(rightSide);

	grEquationParent.appendChild(document.createElement('br'));
	grEquationList.push({'left': leftSide, 'right': rightSide});
};

function grCallClear() {
	for (let i = 0; i < grEquationList.length; i++) {
		let left = document.querySelector(`#gr-l${i}`);
		let right = document.querySelector(`#gr-r${i}`);
		left.value = '';
		right.value = '';
	}
}

let afCanvas = document.querySelector('#af-canvas');
afCanvas.width = 720;
afCanvas.height = 400;

let ctx = afCanvas.getContext('2d');
ctx.fillStyle = '#FFF';
ctx.fillRect(0, 0, afCanvas.width, afCanvas.height);
ctx.fillStyle = '#000';

afConnections = [];
afTransitionStart = null;
afTransitionMode = true;
afParent = document.querySelector('#af-parent');

function afCallClear() {
	afTransitionStart = null;
	afConnections = [];
	let amt = afParent.children.length;
	for (let i = 0; i < amt; i++) {
		afParent.removeChild(afParent.firstChild);
	}
}

let afClear = document.querySelector('#af-clear');
afClear.onclick = afCallClear;

function afCallCreate() {
	let count = afConnections.length + 1;
	let elm = document.createElement('div');
	elm.id = `q${afConnections.length}`;
	elm.innerHTML = `Q${afConnections.length}`;
	elm.classList.add('af-state');
	let rem = window.getComputedStyle(document.body).getPropertyValue('font-size');
	rem = parseInt(rem.slice(0,-2));
	elm.style.top = `${(5*rem)+afCanvas.offsetTop}px`;
	elm.style.left = `${(count*5*rem)+afCanvas.offsetLeft}px`;
	elm.draggable = true;
	afParent.appendChild(elm);
	afConnections.push({});
	let offsetX, offsetY;

	elm.addEventListener('dblclick', dblclickState);
	elm.addEventListener('mousedown', startDragging);
	elm.addEventListener('mouseup', stopDragging);
	document.addEventListener('keydown', function (ev) {
		if (ev.key === 'Escape') {
			stopDragging();
		}
	});

	function startDragging(e) {
		e.preventDefault();
		offsetX = e.clientX - elm.getBoundingClientRect().left;
		offsetY = e.clientY - elm.getBoundingClientRect().top;
		document.addEventListener('mousemove', dragElement);
	}

	function dragElement(e) {
		e.preventDefault();
		let x = e.clientX - offsetX + window.scrollX;
		let y = e.clientY - offsetY + window.scrollY;
		elm.style.left = x + 'px';
		elm.style.top = y + 'px';
	}

	function stopDragging() {
		redraw();
		document.removeEventListener('mousemove', dragElement);
	}
}

let afCreate = document.querySelector('#af-create');
afCreate.onclick = afCallCreate;

function afCallMode() {
	if (afTransitionMode) {
		afTransitionMode = false;
		afMode.innerHTML = 'ATUAL: MODO FINAL/NÃO FINAL';
		if (afTransitionStart !== null) {
			afParent.children[afTransitionStart].classList.remove('selected');
		}
		afTransitionStart = null;
	} else {
		afTransitionMode = true;
		afMode.innerHTML = 'ATUAL: MODO TRANSIÇÃO';
	}
}

let afMode = document.querySelector('#af-mode');
afMode.innerHTML = 'ATUAL: MODO TRANSIÇÃO';
afMode.onclick = afCallMode;

function findClosestState(x, y) {
	if (afParent.childElementCount < 1) return null;
	let closest = 0;
	let rect = afParent.firstChild;
	let minDist = Math.sqrt((x-rect.offsetLeft)**2 + (y-rect.offsetTop)**2);
	for (let i = 0; i < afParent.children.length; i++) {
		rect = afParent.children[i];
		let dist = Math.sqrt((x-rect.offsetLeft)**2 + (y-rect.offsetTop)**2);
		if (dist < minDist) {
			minDist = dist;
			closest = i;
		}
	}
	return closest;
}

function doubleClickState(x, y, symb) {
	if (!afTransitionMode) {
		let target = afParent.children[findClosestState(x, y)];
		target.classList.toggle('final');
		return;
	}
	if (afTransitionStart === null && afTransitionMode) {
		afTransitionStart = findClosestState(x, y);
		afParent.children[afTransitionStart].classList.add('selected');
		return;
	}
	let other = findClosestState(x, y);
	if (typeof symb === 'undefined') {
		symb = prompt('Insira um símbolo para a transição:');
	}
	let stateA = afParent.children[afTransitionStart];
	let stateB = afParent.children[other];
	if (symb !== null && symb !== '') {
		afConnections[afTransitionStart][symb] = other;
	}
	console.log(afConnections);
	stateA.classList.remove('selected');
	afTransitionStart = null;
	redraw();
}

function dblclickState(ev) {
	doubleClickState(ev.clientX+window.scrollX, ev.clientY+window.scrollY);
}

function redraw() {
	ctx.font = '10px monospace';
	ctx.fillStyle = '#FFF';
	ctx.fillRect(0, 0, afCanvas.width, afCanvas.height);
	ctx.fillStyle = '#000';
	for (let i = 0; i < afParent.children.length; i++) {
		let st = afParent.children[i];
		let offset = {};
		let px = 16+parseInt(st.style.left.slice(0,-2))-afCanvas.offsetLeft;
		let py = 16+parseInt(st.style.top.slice(0,-2))-afCanvas.offsetTop;
		for (let [k,v] of Object.entries(afConnections[i])) {
			if (offset[String(v)] === undefined) {
				offset[String(v)] = 0;
			}
			if (v === i) {
				ctx.fillText(k,px,py-18-(offset[String(v)]*11))
			} else {
				ctx.beginPath();
				ctx.moveTo(px, py);
				let other = afParent.children[v];
				let qx = 16+parseInt(other.style.left.slice(0,-2))-afCanvas.offsetLeft;
				let qy = 16+parseInt(other.style.top.slice(0,-2))-afCanvas.offsetTop;
				let dx = qx-px;
				let dy = qy-py;
				let tx = px+(0.25*dx);
				let ty = py+(0.25*dy)-11;
				
				ctx.fillText(k,tx,ty-(offset[String(v)]*11))
				ctx.lineTo(qx, qy);
				ctx.stroke();
			}
			offset[String(v)] = offset[String(v)] + 1;
		}
	}
}

let erClone = document.querySelector('#er-clone');
let grClone = document.querySelector('#gr-clone');
let afClone = document.querySelector('#af-clone');

function ertogr() {
	const grammar = [];
	let currentVarIndex = 65;

	function newVariable() {
		return String.fromCharCode(currentVarIndex++);
	}

	function processGroups(subRegex) {
        let stack = [];
        let result = "";
        let groupStart = -1;

        for (let i = 0; i < subRegex.length; i++) {
            if (subRegex[i] === "(") {
                if (stack.length === 0) groupStart = i;
                stack.push("(");
            } else if (subRegex[i] === ")") {
                stack.pop();
                if (stack.length === 0) {
                    const groupContent = subRegex.slice(groupStart + 1, i);
                    const groupVar = newVariable();
                    parseRegex(groupContent, groupVar);
                    result += groupVar;
                }
            } else if (stack.length === 0) {
                result += subRegex[i];
            }
        }

        return result;
    }

	function parseRegex(subRegex, currentVar) {
		if (subRegex === '') {
			// Para subexpressão vazia
			grammar.push({ left: currentVar, right: 'λ' });
		} else if (/^[a-zA-Z0-9]$/.test(subRegex)) {
			// Para um único caractere
			grammar.push({ left: currentVar, right: subRegex });
		} else if (subRegex.includes('|')) {
			// Para alternância (ex.: a|b)
			const parts = subRegex.split('|');
			parts.forEach((part) => parseRegex(part, currentVar));
		} else if (subRegex.includes('*')) {
			// Para fechamento de Kleene (ex.: a*)
			const nextVar = newVariable();
			//grammar.push({ left: currentVar, right: nextVar });
			parseRegex(subRegex.replace('*', ''), nextVar);
			grammar.push({ left: nextVar, right: 'λ' });
			//grammar.push({ left: nextVar, right: `${nextVar}${currentVar}` });
		} else if (subRegex.includes('+')) {
			// Para uma ou mais ocorrências (ex.: a+)
			const nextVar = newVariable();
			parseRegex(subRegex.replace('+', '*'), currentVar);
			grammar.push({ left: currentVar, right: `${nextVar}${currentVar}` });
		} else if (subRegex.includes("(")) {
            // Para agrupamentos (ex.: (a|b)c)
            const processedRegex = processGroups(subRegex);
            parseRegex(processedRegex, currentVar);
        } else {
			// Concatenação (ex.: ab)
			const [first, ...rest] = subRegex.split('');
			const nextVar = newVariable();
			grammar.push({ left: currentVar, right: `${first}${nextVar}` });
			parseRegex(rest.join(''), nextVar);
		}
	}

	// Início da conversão
	parseRegex(erRule.value, 'A');
	console.log(grammar);

	grCallClear();
	for (let i = grEquationList.length; i < grammar.length; i++) {
		grAdd.onclick();
	}

	for (let i = 0; i < grammar.length; i++) {
		let left = document.querySelector(`#gr-l${i}`);
		let right = document.querySelector(`#gr-r${i}`);
		left.value = grammar[i].left;
		right.value = grammar[i].right;
	}
}

function ertoaf() {

}

function grtoer() {

}

function grtoaf() {
	afCallClear();
	let known = [ document.querySelector('#gr-l0').value ];
	let final = {};
	for (let i = 0; i < grEquationList.length; i++) {
		let left = grEquationList[i].left.value;
		let right = grEquationList[i].right.value;
		if (left.length === 0) { continue; }
		if (!known.includes(left)) { known.push(left); }
		let next = right.slice(-1);
		if (right.length === 0 || right === 'λ') {
			afParent.children[known.indexOf(left)].classList.add('final');
			next = null;
			right = '';
		} else if (!known.includes(next)) {
			known.push(next);
		}
		if (afParent.children.length < known.length) {
			for (let j = afParent.children.length; j < known.length; j++) {
				afCallCreate();
			}
		}
		afTransitionStart = known.indexOf(left);
		console.log(left, next, afTransitionStart, known.indexOf(next));
		console.log(right, right.slice(0,-1));
		if (next === null) {
			let elm = afParent.children[afTransitionStart];
			doubleClickState(elm.offsetLeft, elm.offsetTop, right.slice(0,-1));
		} else {
			let idx = known.indexOf(next);
			let elm = afParent.children[idx];
			let fst = afParent.children[afTransitionStart];
			doubleClickState(elm.offsetLeft, elm.offsetTop, right.slice(0,-1));
		}
	}
	redraw();
}

function aftoer() {
	
}

function aftogr() {
	let offset = ('A').charCodeAt(0);
	let rows = 0;
	grCallClear();
	for (let i = 0; i < afConnections.length; i++) {
		for (let [k, v] of Object.entries(afConnections[i])) {
			if (grEquationList.length <= rows) {
				grAdd.onclick();
			}
			let left = document.querySelector(`#gr-l${rows}`);
			let right = document.querySelector(`#gr-r${rows}`);
			left.value = String.fromCharCode(offset+i);
			right.value = `${k}${String.fromCharCode(offset+v)}`;
			rows++;
		}
		if (afParent.children[i].classList.contains('final')) {
			if (grEquationList.length <= rows) {
				grAdd.onclick();
			}
			let left = document.querySelector(`#gr-l${rows}`);
			let right = document.querySelector(`#gr-r${rows}`);
			left.value = String.fromCharCode(offset+i);
			right.value = 'λ';
			rows++;
		}
	}
}

erClone.onclick = function () { ertogr(); ertoaf(); }
grClone.onclick = function () { grtoer(); grtoaf(); }
afClone.onclick = function () { aftoer(); aftogr(); }

document.querySelectorAll('button').forEach((elm, idx) => {
	let btn = document.querySelector(`#${elm.id}`);
	if (btn.onclick === null) {
		btn.className = 'unavailable';
	}
});