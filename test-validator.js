const fs = require('fs-extra');
const path = require('path');

class TestValidator {
  constructor() {
    this.validationRules = {
      required: ['escenario', 'acciones', 'resultado_esperado'],
      optional: ['descripcion', 'precondiciones', 'tecnica', 'prioridad'],
      maxLengths: {
        escenario: 200,
        descripcion: 1000,
        acciones: 2000,
        resultado_esperado: 500
      }
    };
  }

  validateCSVStructure(data) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(data) || data.length === 0) {
      errors.push('El archivo CSV está vacío o no se pudo parsear correctamente');
      return { isValid: false, errors, warnings };
    }

    // Validar headers
    const firstRow = data[0];
    const headers = Object.keys(firstRow);
    
    for (const required of this.validationRules.required) {
      const normalizedHeaders = headers.map(h => this.normalizeString(h));
      const hasRequired = normalizedHeaders.some(h => h.includes(this.normalizeString(required)));
      
      if (!hasRequired) {
        errors.push(`Columna requerida faltante: ${required}`);
      }
    }

    // Validar cada fila
    data.forEach((row, index) => {
      const rowErrors = this.validateRow(row, index + 1);
      errors.push(...rowErrors.errors);
      warnings.push(...rowErrors.warnings);
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      totalRows: data.length,
      validRows: data.length - errors.filter(e => e.includes('Fila')).length
    };
  }

  validateRow(row, rowNumber) {
    const errors = [];
    const warnings = [];

    // Validar campos requeridos
    for (const field of this.validationRules.required) {
      const value = this.getFieldValue(row, field);
      if (!value || value.trim().length === 0) {
        errors.push(`Fila ${rowNumber}: Campo requerido vacío - ${field}`);
      }
    }

    // Validar longitud máxima
    for (const [field, maxLength] of Object.entries(this.validationRules.maxLengths)) {
      const value = this.getFieldValue(row, field);
      if (value && value.length > maxLength) {
        warnings.push(`Fila ${rowNumber}: Campo ${field} excede la longitud máxima (${maxLength} caracteres)`);
      }
    }

    // Validaciones específicas
    const escenario = this.getFieldValue(row, 'escenario');
    if (escenario && !/^[a-zA-Z0-9\s\-_áéíóúñü]+$/i.test(escenario)) {
      warnings.push(`Fila ${rowNumber}: El escenario contiene caracteres especiales que podrían causar problemas`);
    }

    const prioridad = this.getFieldValue(row, 'prioridad');
    if (prioridad && !['alta', 'media', 'baja', 'crítica', 'high', 'medium', 'low', 'critical'].includes(prioridad.toLowerCase())) {
      warnings.push(`Fila ${rowNumber}: Prioridad no reconocida - ${prioridad}`);
    }

    return { errors, warnings };
  }

  getFieldValue(row, fieldName) {
    // Buscar el campo por nombre exacto o normalizado
    for (const [key, value] of Object.entries(row)) {
      if (this.normalizeString(key).includes(this.normalizeString(fieldName))) {
        return value;
      }
    }
    return null;
  }

  normalizeString(str) {
    return str.toLowerCase()
      .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
      .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, '');
  }

  generateValidationReport(projectPath, validationResults) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalRows: validationResults.totalRows,
        validRows: validationResults.validRows,
        isValid: validationResults.isValid,
        errorCount: validationResults.errors.length,
        warningCount: validationResults.warnings.length
      },
      errors: validationResults.errors,
      warnings: validationResults.warnings,
      recommendations: this.generateRecommendations(validationResults)
    };

    // Generar reporte HTML
    const htmlReport = this.generateValidationHTML(report);
    const reportPath = path.join(projectPath, 'reports', 'validacion-csv.html');
    
    return fs.writeFile(reportPath, htmlReport).then(() => {
      console.log(`📋 Reporte de validación generado: ${reportPath}`);
      return report;
    });
  }

  generateRecommendations(validationResults) {
    const recommendations = [];

    if (validationResults.errors.length > 0) {
      recommendations.push({
        type: 'error',
        title: 'Errores Críticos',
        message: 'Corrige los errores antes de proceder con la generación de tests.',
        action: 'Revisa y corrige los campos requeridos faltantes'
      });
    }

    if (validationResults.warnings.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Advertencias',
        message: 'Hay advertencias que podrían afectar la generación de tests.',
        action: 'Revisa los campos señalados para mejorar la calidad'
      });
    }

    if (validationResults.totalRows > 50) {
      recommendations.push({
        type: 'info',
        title: 'Archivo Grande',
        message: 'El archivo contiene muchas filas. El procesamiento puede tardar más tiempo.',
        action: 'Considera dividir en archivos más pequeños si es necesario'
      });
    }

    return recommendations;
  }

  generateValidationHTML(report) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Validación CSV</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; margin: -30px -30px 30px -30px; border-radius: 8px 8px 0 0; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .summary-card { padding: 15px; border-radius: 6px; text-align: center; }
        .summary-card.success { background: #d4edda; border: 1px solid #c3e6cb; }
        .summary-card.error { background: #f8d7da; border: 1px solid #f5c6cb; }
        .summary-card.warning { background: #fff3cd; border: 1px solid #ffeaa7; }
        .summary-card.info { background: #d1ecf1; border: 1px solid #bee5eb; }
        .issue-list { margin: 20px 0; }
        .issue { padding: 10px; margin: 5px 0; border-left: 4px solid; }
        .issue.error { border-left-color: #dc3545; background: #f8d7da; }
        .issue.warning { border-left-color: #ffc107; background: #fff3cd; }
        .recommendation { padding: 15px; margin: 10px 0; border-radius: 6px; }
        .recommendation.error { background: #f8d7da; border: 1px solid #f5c6cb; }
        .recommendation.warning { background: #fff3cd; border: 1px solid #ffeaa7; }
        .recommendation.info { background: #d1ecf1; border: 1px solid #bee5eb; }
        h1, h2, h3 { color: #333; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Reporte de Validación CSV</h1>
            <p class="timestamp">Generado el ${new Date(report.timestamp).toLocaleString()}</p>
        </div>

        <section class="summary">
            <div class="summary-card ${report.summary.isValid ? 'success' : 'error'}">
                <h3>${report.summary.isValid ? '✅ Válido' : '❌ Inválido'}</h3>
                <p>Estado general</p>
            </div>
            <div class="summary-card info">
                <h3>${report.summary.totalRows}</h3>
                <p>Total de filas</p>
            </div>
            <div class="summary-card ${report.summary.errorCount > 0 ? 'error' : 'success'}">
                <h3>${report.summary.errorCount}</h3>
                <p>Errores</p>
            </div>
            <div class="summary-card ${report.summary.warningCount > 0 ? 'warning' : 'success'}">
                <h3>${report.summary.warningCount}</h3>
                <p>Advertencias</p>
            </div>
        </section>

        ${report.errors.length > 0 ? `
        <section class="issue-list">
            <h2>❌ Errores Encontrados</h2>
            ${report.errors.map(error => `<div class="issue error">${error}</div>`).join('')}
        </section>
        ` : ''}

        ${report.warnings.length > 0 ? `
        <section class="issue-list">
            <h2>⚠️ Advertencias</h2>
            ${report.warnings.map(warning => `<div class="issue warning">${warning}</div>`).join('')}
        </section>
        ` : ''}

        ${report.recommendations.length > 0 ? `
        <section>
            <h2>💡 Recomendaciones</h2>
            ${report.recommendations.map(rec => `
                <div class="recommendation ${rec.type}">
                    <h3>${rec.title}</h3>
                    <p><strong>Mensaje:</strong> ${rec.message}</p>
                    <p><strong>Acción:</strong> ${rec.action}</p>
                </div>
            `).join('')}
        </section>
        ` : ''}
    </div>
</body>
</html>`;
  }
}

module.exports = TestValidator;
