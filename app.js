const scenarios = {
  analyst: {
    label: 'Analyst exploration',
    state: 'Release with evidence',
    gate: 3,
    owner: 'Enterprise Services + analyst product owner',
    evidence: 'Question trace, data lineage, explanation record, user feedback',
    risk: 'Low if the human decision and source trace stay visible',
    next: 'Prototype in a bounded analyst workflow; measure decision usefulness and feedback quality.'
  },
  mapping: {
    label: 'Real-time network mapping',
    state: 'Conditional release',
    gate: 4,
    owner: 'Enterprise Services + data engineering + security',
    evidence: 'Entity-resolution tests, latency, lineage, access controls, analyst validation',
    risk: 'Medium: speed can outpace entity confidence and review',
    next: 'Run a representative stream through the architecture; hold expansion until identity and lineage tests pass.'
  },
  classified: {
    label: 'Classified-data integration',
    state: 'Hold at boundary',
    gate: 2,
    owner: 'Cross-Domain Working Group + security authority',
    evidence: 'Data classification, transfer path, authorization boundary, audit design',
    risk: 'High until the cross-domain path and decision rights are explicit',
    next: 'Do not prototype around the boundary. Resolve authority, transfer controls, and audit evidence first.'
  }
};

function applyScenario(key) {
  const scenario = scenarios[key];
  if (!scenario) return;

  document.querySelectorAll('.scenario-button').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.scenario === key));
  });

  const fields = {
    'scenario-label': scenario.label,
    'output-state': scenario.state,
    owner: scenario.owner,
    evidence: scenario.evidence,
    risk: scenario.risk,
    next: scenario.next
  };

  Object.entries(fields).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
}

document.querySelectorAll('.scenario-button').forEach((button) => {
  button.addEventListener('click', () => applyScenario(button.dataset.scenario));
});
document.getElementById('reset-scenario')?.addEventListener('click', () => applyScenario('analyst'));
applyScenario('analyst');

const airlockStages = [
  'Mission, data, dependency and risk context',
  'CSP, AI/ML and cross-domain fit',
  'Reference patterns and authority',
  'Controlled data and service movement',
  'Operational handoff and feedback'
];

const airlock = document.querySelector('.airlock');
const chamberTrack = airlock?.querySelector('.chambers');
const chambers = chamberTrack ? Array.from(chamberTrack.querySelectorAll('.chamber')) : [];
const capsule = airlock?.querySelector('.service-capsule');
const airlockSeal = airlock?.querySelector('.seal');
const releaseCondition = airlock?.querySelector('.readout-main span');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let airlockTimer;

function loadAirlockStyles() {
  if (document.querySelector('link[data-airlock-progress]')) return;
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = 'airlock-progress.css';
  stylesheet.dataset.airlockProgress = 'true';
  document.head.appendChild(stylesheet);
}

function installCapsuleOnTrack() {
  if (capsule && chamberTrack && capsule.parentElement !== chamberTrack) {
    chamberTrack.appendChild(capsule);
  }
}

function setAirlockStage(index, complete = false) {
  if (!airlock || !chamberTrack || !capsule || chambers.length === 0) return;

  const lastIndex = chambers.length - 1;
  const stage = Math.max(0, Math.min(index, lastIndex));
  const left = 10 + (stage * 80) / lastIndex;
  const progress = (stage * 100) / lastIndex;

  chambers.forEach((chamber, chamberIndex) => {
    chamber.classList.toggle('active', chamberIndex === stage);
    chamber.classList.toggle('completed', chamberIndex < stage || complete);
    chamber.setAttribute(
      'data-progress-state',
      chamberIndex < stage || complete ? 'complete' : chamberIndex === stage ? 'active' : 'pending'
    );
  });

  capsule.style.left = `${left}%`;
  chamberTrack.style.setProperty('--airlock-progress', `${progress}%`);
  airlock.classList.toggle('complete', complete);

  if (airlockSeal) {
    airlockSeal.textContent = complete ? 'Analyst ready' : `Gate ${String(stage + 1).padStart(2, '0')}`;
  }
  if (releaseCondition) {
    releaseCondition.textContent = complete
      ? 'Mission value + lineage + explanation + human authority + operational owner'
      : airlockStages[stage];
  }
}

function stopAirlockAnimation() {
  window.clearTimeout(airlockTimer);
}

function startAirlockAnimation() {
  stopAirlockAnimation();
  loadAirlockStyles();
  installCapsuleOnTrack();

  if (!airlock || chambers.length === 0) return;

  if (reducedMotion.matches) {
    setAirlockStage(chambers.length - 1, true);
    return;
  }

  let stage = 0;
  setAirlockStage(stage);

  const advance = () => {
    if (document.hidden) {
      airlockTimer = window.setTimeout(advance, 500);
      return;
    }

    if (stage < chambers.length - 1) {
      stage += 1;
      setAirlockStage(stage);
      airlockTimer = window.setTimeout(advance, 1450);
      return;
    }

    setAirlockStage(stage, true);
    airlockTimer = window.setTimeout(() => {
      stage = 0;
      setAirlockStage(stage);
      airlockTimer = window.setTimeout(advance, 1450);
    }, 2200);
  };

  airlockTimer = window.setTimeout(advance, 1450);
}

reducedMotion.addEventListener?.('change', startAirlockAnimation);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) startAirlockAnimation();
});
startAirlockAnimation();

const menu = document.querySelector('.menu-button');
const links = document.querySelector('.nav-links');
menu?.addEventListener('click', () => {
  const open = links?.classList.toggle('open') ?? false;
  menu.setAttribute('aria-expanded', String(open));
});
