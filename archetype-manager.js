const fs = require('fs-extra');
const path = require('path');

class ArchetypeManager {
  constructor() {
    this.archetypesPath = path.join(__dirname, 'Arquetipos');
  }

  async createBaseArchetypes() {
    // Arquetipo para tests de login
    const loginArchetype = `import { test, expect } from '@playwright/test';

test.describe('Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('successful login', async ({ page }) => {
    // Completar campos de login
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    
    // Hacer clic en login
    await page.click('[data-testid="login-button"]');
    
    // Verificar redirección
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
  });

  test('failed login', async ({ page }) => {
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });
});`;

    // Arquetipo para tests de e-commerce
    const ecommerceArchetype = `import { test, expect } from '@playwright/test';

test.describe('E-commerce Tests', () => {
  test('search and add to cart flow', async ({ page }) => {
    await page.goto('/');
    
    // Buscar producto
    await page.fill('[data-testid="search-input"]', 'laptop');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Seleccionar primer producto
    await page.click('[data-testid="product-item"]:first-child');
    
    // Agregar al carrito
    await page.click('[data-testid="add-to-cart"]');
    
    // Verificar carrito
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
  });

  test('complete checkout process', async ({ page }) => {
    // Prerequisito: producto en carrito
    await page.goto('/cart');
    
    // Ir a checkout
    await page.click('[data-testid="checkout-button"]');
    
    // Completar información de envío
    await page.fill('[data-testid="shipping-name"]', 'John Doe');
    await page.fill('[data-testid="shipping-address"]', '123 Main St');
    await page.fill('[data-testid="shipping-city"]', 'New York');
    
    // Seleccionar método de pago
    await page.click('[data-testid="payment-credit-card"]');
    await page.fill('[data-testid="card-number"]', '4111111111111111');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvv"]', '123');
    
    // Confirmar orden
    await page.click('[data-testid="place-order"]');
    
    // Verificar confirmación
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
  });
});`;

    // Arquetipo para tests de formularios
    const formArchetype = `import { test, expect } from '@playwright/test';

test.describe('Form Tests', () => {
  test('user registration form', async ({ page }) => {
    await page.goto('/register');
    
    // Completar formulario
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john.doe@example.com');
    await page.fill('[data-testid="password"]', 'SecurePass123!');
    await page.fill('[data-testid="confirm-password"]', 'SecurePass123!');
    
    // Aceptar términos
    await page.check('[data-testid="terms-checkbox"]');
    
    // Enviar formulario
    await page.click('[data-testid="register-button"]');
    
    // Verificar éxito
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('form validation', async ({ page }) => {
    await page.goto('/register');
    
    // Intentar enviar formulario vacío
    await page.click('[data-testid="register-button"]');
    
    // Verificar mensajes de validación
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required');
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password is required');
  });
});`;

    // Arquetipo para tests responsivos
    const responsiveArchetype = `import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  test('mobile navigation', async ({ page }) => {
    // Configurar viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verificar menú hamburguesa
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Verificar navegación móvil
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
  });

  test('tablet layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Verificar layout específico para tablet
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  });
});`;

    // Guardar arquetipos
    await fs.ensureDir(this.archetypesPath);
    await fs.writeFile(path.join(this.archetypesPath, 'login-archetype.js'), loginArchetype);
    await fs.writeFile(path.join(this.archetypesPath, 'ecommerce-archetype.js'), ecommerceArchetype);
    await fs.writeFile(path.join(this.archetypesPath, 'form-archetype.js'), formArchetype);
    await fs.writeFile(path.join(this.archetypesPath, 'responsive-archetype.js'), responsiveArchetype);

    console.log('✅ Arquetipos base creados en carpeta Arquetipos/');
  }

  async getArchetypeByType(testType) {
    const archetypeMap = {
      'login': 'login-archetype.js',
      'ecommerce': 'ecommerce-archetype.js',
      'form': 'form-archetype.js',
      'responsive': 'responsive-archetype.js'
    };

    const archetypeFile = archetypeMap[testType.toLowerCase()];
    if (archetypeFile) {
      const archetypePath = path.join(this.archetypesPath, archetypeFile);
      if (await fs.pathExists(archetypePath)) {
        return await fs.readFile(archetypePath, 'utf8');
      }
    }

    return null;
  }
}

module.exports = ArchetypeManager;
