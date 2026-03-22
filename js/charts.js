/* ================================================================
   FINANCEFLOW — CHART RENDERING (pure JS, no dependencies)
   ================================================================ */
const Charts = {
    colors: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#ec4899', '#14b8a6', '#f97316'],

    // Bar chart
    barChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container || !data.length) return;
        const max = Math.max(...data.map(d => d.value), 1);
        const barColor = options.color || 'var(--accent)';

        let html = '<div class="bar-chart-grid">';
        data.forEach((d, i) => {
            const height = (d.value / max) * 100;
            const color = options.multiColor ? (d.color || this.colors[i % this.colors.length]) : barColor;
            html += `
                <div class="bar-col">
                    <div class="bar-fill" style="height:${height}%;background:${color}">
                        <div class="bar-tooltip">${d.label}: ${options.format === 'currency' ? Utils.currency(d.value) : d.value}</div>
                    </div>
                    <div class="bar-label">${d.shortLabel || d.label}</div>
                </div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    },

    // Donut chart via SVG
    donutChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container || !data.length) return;
        const total = data.reduce((s, d) => s + d.value, 0);
        if (total === 0) { container.innerHTML = '<div class="empty-state"><p>No data</p></div>'; return; }

        const size = options.size || 180;
        const cx = size / 2, cy = size / 2, r = size * 0.35;
        const strokeWidth = size * 0.12;
        const circumference = 2 * Math.PI * r;
        let offset = 0;

        let paths = '';
        data.forEach((d, i) => {
            const pct = d.value / total;
            const dash = circumference * pct;
            const gap = circumference - dash;
            const color = d.color || this.colors[i % this.colors.length];
            paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"
                        stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-offset}"
                        transform="rotate(-90 ${cx} ${cy})" style="transition:stroke-dashoffset 0.6s ease"/>`;
            offset += dash;
        });

        let legend = '<div class="chart-legend">';
        data.forEach((d, i) => {
            const color = d.color || this.colors[i % this.colors.length];
            const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : 0;
            legend += `<div class="chart-legend-item"><span class="chart-legend-dot" style="background:${color}"></span>${d.label} (${pct}%)</div>`;
        });
        legend += '</div>';

        container.innerHTML = `
            <div style="position:relative;display:inline-block">
                <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${paths}</svg>
                <div class="donut-center-text">
                    <div class="donut-center-value">${options.centerFormat === 'currency' ? Utils.currency(total) : total}</div>
                    <div class="donut-center-label">${options.centerLabel || 'Total'}</div>
                </div>
            </div>
            ${legend}`;
    },

    // Line chart via SVG
    lineChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container || !data.length) return;
        const max = Math.max(...data.map(d => d.value), 1);
        const w = options.width || 500;
        const h = options.height || 180;
        const padL = 10, padR = 10, padT = 10, padB = 20;
        const chartW = w - padL - padR;
        const chartH = h - padT - padB;

        let points = data.map((d, i) => {
            const x = padL + (i / (data.length - 1 || 1)) * chartW;
            const y = padT + chartH - (d.value / max) * chartH;
            return `${x},${y}`;
        });

        // Area fill
        const areaPoints = points.join(' ') + ` ${padL + chartW},${padT + chartH} ${padL},${padT + chartH}`;
        const color = options.color || '#6366f1';

        // Grid lines
        let gridLines = '';
        for (let i = 0; i <= 4; i++) {
            const y = padT + (i / 4) * chartH;
            gridLines += `<line x1="${padL}" y1="${y}" x2="${padL + chartW}" y2="${y}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>`;
        }

        // Dots
        let dots = data.map((d, i) => {
            const x = padL + (i / (data.length - 1 || 1)) * chartW;
            const y = padT + chartH - (d.value / max) * chartH;
            return `<circle cx="${x}" cy="${y}" r="3.5" fill="${color}" stroke="var(--bg-secondary)" stroke-width="2"/>`;
        }).join('');

        let xLabels = '<div class="line-x-labels">';
        data.forEach(d => { xLabels += `<span class="line-x-label">${d.label}</span>`; });
        xLabels += '</div>';

        container.innerHTML = `
            <svg width="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
                ${gridLines}
                <polygon points="${areaPoints}" fill="url(#areaGradient-${containerId})" opacity="0.3"/>
                <polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                ${dots}
                <defs><linearGradient id="areaGradient-${containerId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.4"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
            </svg>
            ${xLabels}`;
    },

    // Horizontal bar (used in budget comparisons)
    horizontalBar(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const max = Math.max(...data.map(d => d.max || d.value), 1);
        let html = '';
        data.forEach((d, i) => {
            const pct = Math.min((d.value / (d.max || max)) * 100, 100);
            const overPct = d.value > (d.max || max) ? ((d.value / (d.max || max)) * 100) : 0;
            const barClass = pct > 90 ? 'over' : pct > 70 ? 'near' : 'under';
            html += `
                <div style="margin-bottom:12px">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                        <span style="font-size:var(--font-sm);font-weight:500">${d.label}</span>
                        <span style="font-size:var(--font-xs);color:var(--text-tertiary)">${options.format === 'currency' ? Utils.currency(d.value) : d.value} / ${options.format === 'currency' ? Utils.currency(d.max) : d.max}</span>
                    </div>
                    <div class="budget-bar-wrap">
                        <div class="budget-bar ${barClass}" style="width:${Math.min(pct, 100)}%"></div>
                    </div>
                </div>`;
        });
        container.innerHTML = html;
    }
};
