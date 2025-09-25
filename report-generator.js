const fs = require('fs-extra');
const path = require('path');

class ReportGenerator {
  constructor() {
    this.reportTemplates = {
      html: this.getHTMLTemplate(),
      css: this.getCSSTemplate()
    };
  }

  async generateComprehensiveReport(projectPath, projectName, testResults, executionStats) {
    const reportData = {
      projectName,
      timestamp: new Date().toISOString(),
      executionStats,
      testResults,
      summary: this.calculateSummary(testResults, executionStats)
    };

    // Generar reporte HTML
    const htmlReport = this.generateHTMLReport(reportData);
    const htmlPath = path.join(projectPath, 'reports', 'reporte-ejecutivo.html');
    await fs.writeFile(htmlPath, htmlReport);

    // Generar archivo CSS
    const cssPath = path.join(projectPath, 'reports', 'styles.css');
    await fs.writeFile(cssPath, this.reportTemplates.css);

    // Generar reporte JSON para integración
    const jsonPath = path.join(projectPath, 'reports', 'reporte-datos.json');
    await fs.writeFile(jsonPath, JSON.stringify(reportData, null, 2));

    console.log(`📊 Reporte ejecutivo generado: ${htmlPath}`);
    return htmlPath;
  }

  generateHTMLReport(data) {
    return this.reportTemplates.html
      .replace('{{PROJECT_NAME}}', data.projectName)
      .replace('{{TIMESTAMP}}', new Date(data.timestamp).toLocaleString())
      .replace('{{SUMMARY_CARDS}}', this.generateSummaryCards(data.summary))
      .replace('{{EXECUTION_CHART}}', this.generateExecutionChart(data.executionStats))
      .replace('{{TEST_DETAILS}}', this.generateTestDetails(data.testResults))
      .replace('{{RECOMMENDATIONS}}', this.generateRecommendations(data.summary));
  }

  generateSummaryCards(summary) {
    return `
      <div class="summary-grid">
        <div class="summary-card success">
          <div class="card-icon">✅</div>
          <div class="card-content">
            <h3>${summary.passed}</h3>
            <p>Tests Exitosos</p>
          </div>
        </div>
        
        <div class="summary-card error">
          <div class="card-icon">❌</div>
          <div class="card-content">
            <h3>${summary.failed}</h3>
            <p>Tests Fallidos</p>
          </div>
        </div>
        
        <div class="summary-card warning">
          <div class="card-icon">⏭️</div>
          <div class="card-content">
            <h3>${summary.skipped}</h3>
            <p>Tests Omitidos</p>
          </div>
        </div>
        
        <div class="summary-card info">
          <div class="card-icon">⏱️</div>
          <div class="card-content">
            <h3>${summary.totalTime}ms</h3>
            <p>Tiempo Total</p>
          </div>
        </div>
      </div>
    `;
  }

  generateExecutionChart(stats) {
    const total = (stats?.passed || 0) + (stats?.failed || 0) + (stats?.skipped || 0);
    const passedPercent = total > 0 ? ((stats?.passed || 0) / total) * 100 : 0;
    const failedPercent = total > 0 ? ((stats?.failed || 0) / total) * 100 : 0;
    const skippedPercent = total > 0 ? ((stats?.skipped || 0) / total) * 100 : 0;

    return `
      <div class="chart-container">
        <div class="chart-title">Distribución de Resultados</div>
        <div class="progress-chart">
          <div class="progress-bar">
            <div class="progress-segment success" style="width: ${passedPercent}%"></div>
            <div class="progress-segment error" style="width: ${failedPercent}%"></div>
            <div class="progress-segment warning" style="width: ${skippedPercent}%"></div>
          </div>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-color success"></span>
              <span>Exitosos (${passedPercent.toFixed(1)}%)</span>
            </div>
            <div class="legend-item">
              <span class="legend-color error"></span>
              <span>Fallidos (${failedPercent.toFixed(1)}%)</span>
            </div>
            <div class="legend-item">
              <span class="legend-color warning"></span>
              <span>Omitidos (${skippedPercent.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  generateTestDetails(testResults) {
    if (!testResults || !testResults.length) {
      return '<p class="no-results">No hay resultados de tests disponibles.</p>';
    }

    return testResults.map((test, index) => `
      <div class="test-case-detail ${test.status}">
        <div class="test-header">
          <div class="test-number">${index + 1}</div>
          <div class="test-info">
            <h4>${test.title || test.name || `Test ${index + 1}`}</h4>
            <div class="test-meta">
              <span class="test-status ${test.status}">${test.status}</span>
              <span class="test-duration">${test.duration || 0}ms</span>
              <span class="test-file">${test.file || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        ${test.error ? `
          <div class="test-error">
            <h5>Error:</h5>
            <pre>${test.error}</pre>
          </div>
        ` : ''}
        
        ${test.steps && test.steps.length > 0 ? `
          <div class="test-steps">
            <h5>Pasos ejecutados:</h5>
            <ol>
              ${test.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  generateRecommendations(summary) {
    const recommendations = [];

    if (summary.failed > 0) {
      recommendations.push({
        type: 'error',
        title: 'Tests Fallidos',
        message: `Se detectaron ${summary.failed} tests fallidos. Revisa los errores y selectores utilizados.`
      });
    }

    if (summary.successRate < 0.8) {
      recommendations.push({
        type: 'warning',
        title: 'Tasa de Éxito Baja',
        message: 'La tasa de éxito es menor al 80%. Considera revisar la estabilidad de los selectores.'
      });
    }

    if (summary.avgDuration > 10000) {
      recommendations.push({
        type: 'info',
        title: 'Rendimiento',
        message: 'Algunos tests tardan más de 10 segundos. Considera optimizar los tiempos de espera.'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        title: '¡Excelente!',
        message: 'Todos los tests se ejecutaron correctamente sin problemas detectados.'
      });
    }

    return recommendations.map(rec => `
      <div class="recommendation ${rec.type}">
        <h4>${rec.title}</h4>
        <p>${rec.message}</p>
      </div>
    `).join('');
  }

  calculateSummary(testResults, executionStats) {
    const passed = executionStats?.passed || 0;
    const failed = executionStats?.failed || 0;
    const skipped = executionStats?.skipped || 0;
    const total = passed + failed + skipped;
    
    const totalTime = testResults?.reduce((acc, test) => acc + (test.duration || 0), 0) || 0;
    const avgDuration = total > 0 ? totalTime / total : 0;
    const successRate = total > 0 ? passed / total : 0;

    return {
      total,
      passed,
      failed,
      skipped,
      successRate,
      totalTime,
      avgDuration
    };
  }

  getHTMLTemplate() {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Ejecutivo - {{PROJECT_NAME}}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header class="report-header">
            <div class="header-content">
                <h1>📊 Reporte Ejecutivo de Tests</h1>
                <div class="project-info">
                    <h2>{{PROJECT_NAME}}</h2>
                    <p class="timestamp">Generado el {{TIMESTAMP}}</p>
                </div>
            </div>
        </header>

        <main class="report-content">
            <section class="summary-section">
                <h3>📈 Resumen Ejecutivo</h3>
                {{SUMMARY_CARDS}}
            </section>

            <section class="chart-section">
                {{EXECUTION_CHART}}
            </section>

            <section class="details-section">
                <h3>🔍 Detalles de Tests</h3>
                <div class="test-cases">
                    {{TEST_DETAILS}}
                </div>
            </section>

            <section class="recommendations-section">
                <h3>💡 Recomendaciones</h3>
                <div class="recommendations">
                    {{RECOMMENDATIONS}}
                </div>
            </section>
        </main>

        <footer class="report-footer">
            <p>Generado automáticamente por CrewAI + Playwright System</p>
            <p class="timestamp">{{TIMESTAMP}}</p>
        </footer>
    </div>
</body>
</html>`;
  }

  getCSSTemplate() {
    return `/* Estilos base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    overflow: hidden;
}

/* Header */
.report-header {
    background: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%);
    color: white;
    padding: 30px;
    text-align: center;
}

.header-content h1 {
    font-size: 2.5em;
    margin-bottom: 10px;
}

.project-info h2 {
    font-size: 1.8em;
    margin-bottom: 5px;
}

.timestamp {
    opacity: 0.9;
    font-size: 0.9em;
}

/* Contenido principal */
.report-content {
    padding: 30px;
}

.summary-section h3,
.details-section h3,
.recommendations-section h3 {
    color: #333;
    margin-bottom: 20px;
    font-size: 1.5em;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 10px;
}

/* Tarjetas de resumen */
.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.summary-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    border-left: 4px solid;
}

.summary-card.success { border-left-color: #4CAF50; }
.summary-card.error { border-left-color: #f44336; }
.summary-card.warning { border-left-color: #ff9800; }
.summary-card.info { border-left-color: #2196F3; }

.card-icon {
    font-size: 2em;
    margin-right: 15px;
}

.card-content h3 {
    font-size: 2em;
    margin-bottom: 5px;
    color: #333;
}

.card-content p {
    color: #666;
    font-size: 0.9em;
}

/* Gráficos */
.chart-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    margin-bottom: 30px;
}

.chart-title {
    font-size: 1.2em;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
}

.progress-bar {
    height: 30px;
    background: #f0f0f0;
    border-radius: 15px;
    overflow: hidden;
    display: flex;
    margin-bottom: 15px;
}

.progress-segment {
    height: 100%;
    transition: width 0.3s ease;
}

.progress-segment.success { background: #4CAF50; }
.progress-segment.error { background: #f44336; }
.progress-segment.warning { background: #ff9800; }

.chart-legend {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 15px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 2px;
}

.legend-color.success { background: #4CAF50; }
.legend-color.error { background: #f44336; }
.legend-color.warning { background: #ff9800; }

/* Detalles de tests */
.test-case-detail {
    background: white;
    border-radius: 8px;
    margin-bottom: 15px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border-left: 4px solid #ddd;
    overflow: hidden;
}

.test-case-detail.passed { border-left-color: #4CAF50; }
.test-case-detail.failed { border-left-color: #f44336; }
.test-case-detail.skipped { border-left-color: #ff9800; }

.test-header {
    padding: 15px;
    display: flex;
    align-items: center;
    background: #f9f9f9;
}

.test-number {
    background: #2196F3;
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    font-weight: bold;
}

.test-info h4 {
    color: #333;
    margin-bottom: 5px;
}

.test-meta {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}

.test-status {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.8em;
    font-weight: bold;
    text-transform: uppercase;
}

.test-status.passed {
    background: #4CAF50;
    color: white;
}

.test-status.failed {
    background: #f44336;
    color: white;
}

.test-status.skipped {
    background: #ff9800;
    color: white;
}

.test-duration,
.test-file {
    font-size: 0.8em;
    color: #666;
}

.test-error {
    padding: 15px;
    background: #fff5f5;
    border-top: 1px solid #fed7d7;
}

.test-error h5 {
    color: #c53030;
    margin-bottom: 8px;
}

.test-error pre {
    background: #f7fafc;
    padding: 10px;
    border-radius: 4px;
    font-size: 0.9em;
    overflow-x: auto;
}

.test-steps {
    padding: 15px;
    background: #f7fafc;
}

.test-steps h5 {
    color: #2d3748;
    margin-bottom: 8px;
}

.test-steps ol {
    padding-left: 20px;
}

.test-steps li {
    margin-bottom: 4px;
    color: #4a5568;
}

/* Recomendaciones */
.recommendation {
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 8px;
    border-left: 4px solid;
}

.recommendation.success {
    background: #f0fff4;
    border-left-color: #4CAF50;
}

.recommendation.error {
    background: #fff5f5;
    border-left-color: #f44336;
}

.recommendation.warning {
    background: #fffbf0;
    border-left-color: #ff9800;
}

.recommendation.info {
    background: #f0f9ff;
    border-left-color: #2196F3;
}

.recommendation h4 {
    margin-bottom: 8px;
    color: #333;
}

.recommendation p {
    color: #666;
    line-height: 1.5;
}

/* Footer */
.report-footer {
    background: #f8f9fa;
    padding: 20px;
    text-align: center;
    border-top: 1px solid #dee2e6;
    color: #6c757d;
    font-size: 0.9em;
}

/* Responsivo */
@media (max-width: 768px) {
    body {
        padding: 10px;
    }
    
    .report-content {
        padding: 20px;
    }
    
    .header-content h1 {
        font-size: 2em;
    }
    
    .summary-grid {
        grid-template-columns: 1fr;
    }
    
    .chart-legend {
        flex-direction: column;
        align-items: center;
    }
    
    .test-meta {
        flex-direction: column;
        gap: 5px;
    }
}

.no-results {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 40px;
}`;
  }
}

module.exports = ReportGenerator;
