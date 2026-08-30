<script lang="ts">
  export let score: number = 85;
  export let size: 'sm' | 'md' | 'lg' = 'md';

  $: radius = size === 'sm' ? 13 : size === 'lg' ? 22 : 16;
  $: strokeWidth = size === 'sm' ? 2.5 : size === 'lg' ? 3.5 : 3;
  $: circumference = 2 * Math.PI * radius;
  $: strokeDashoffset = circumference - (score / 100) * circumference;
  $: svgSize = (radius + strokeWidth) * 2;

  $: colorClass =
    score >= 85 ? 'score-emerald' :
    score >= 75 ? 'score-cyan' :
    score >= 60 ? 'score-amber' : 'score-rose';
</script>

<div class="match-badge {colorClass} size-{size}">
  <svg width={svgSize} height={svgSize} class="score-ring">
    <circle
      cx={svgSize / 2}
      cy={svgSize / 2}
      r={radius}
      class="ring-bg"
      stroke-width={strokeWidth}
    />
    <circle
      cx={svgSize / 2}
      cy={svgSize / 2}
      r={radius}
      class="ring-progress"
      stroke-width={strokeWidth}
      stroke-dasharray={circumference}
      stroke-dashoffset={strokeDashoffset}
    />
  </svg>
  <div class="score-text">
    <span class="score-number">{score}</span><span class="score-percent">%</span>
  </div>
</div>

<style>
  .match-badge {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .score-ring {
    transform: rotate(-90deg);
  }

  .ring-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.08);
  }

  .ring-progress {
    fill: none;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.4s ease-out;
  }

  .score-text {
    position: absolute;
    display: flex;
    align-items: baseline;
    justify-content: center;
    font-family: var(--font-mono);
    font-weight: 600;
    line-height: 1;
  }

  /* Color Schemes without cheesy neon glows */
  .score-emerald .ring-progress { stroke: #10b981; }
  .score-emerald .score-text { color: #34d399; }

  .score-cyan .ring-progress { stroke: #38bdf8; }
  .score-cyan .score-text { color: #38bdf8; }

  .score-amber .ring-progress { stroke: #f59e0b; }
  .score-amber .score-text { color: #fbbf24; }

  .score-rose .ring-progress { stroke: #f43f5e; }
  .score-rose .score-text { color: #fb7185; }

  /* Sizes */
  .size-sm .score-number { font-size: 0.7rem; }
  .size-sm .score-percent { font-size: 0.55rem; }

  .size-md .score-number { font-size: 0.82rem; }
  .size-md .score-percent { font-size: 0.62rem; }

  .size-lg .score-number { font-size: 1.05rem; }
  .size-lg .score-percent { font-size: 0.72rem; }
</style>
