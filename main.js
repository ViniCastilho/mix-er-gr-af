let erRule = document.querySelector('#er-rule');
erRule.addEventListener('keyup', function (ev) {
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
});

let grSymbols = {};
let grEquationCount = 1;
let grEquationParent = document.querySelector('#gr-eq');
let grEquationList = [{
	'left': document.querySelector('gr-l0'),
	'right': document.querySelector('gr-r0'),
}];
let grAdd = document.querySelector('#gr-add');
grAdd.onclick = function (ev) {
	let leftSide = document.createElement('input');
	leftSide.id = `gr-l${grEquationCount}`;
	leftSide.className = 'gr-leq';
	leftSide.type = 'text';
	leftSide.placeholder = 'S';
	leftSide.maxLength = 1;
	grEquationParent.appendChild(leftSide);

	let rightSide = document.createElement('input');
	rightSide.id = `g-rs-${grEquationCount}`;
	rightSide.className = 'gr-req';
	rightSide.type = 'text';
	rightSide.placeholder = 'λ';
	grEquationParent.appendChild(rightSide);

	grEquationParent.appendChild(document.createElement('br'));
	grEquationList.push({'left': leftSide, 'right': rightSide});
	grEquationCount++;
};

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
	elm.style.top = `${(3*rem)+afCanvas.offsetTop}px`;
	elm.style.left = `${(count*3*rem)+afCanvas.offsetLeft}px`;
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

function doubleClickState(x, y) {
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
	let symb = prompt('Insira um símbolo para a transição:');
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
				ctx.fillText(k,px-20,py+18+(offset[String(v)]*11))
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

document.querySelectorAll('button').forEach((elm, idx) => {
	let btn = document.querySelector(`#${elm.id}`);
	if (btn.onclick === null) {
		btn.className = 'unavailable';
	}
});

/*
	NÃO HÁ TEMPO
*/