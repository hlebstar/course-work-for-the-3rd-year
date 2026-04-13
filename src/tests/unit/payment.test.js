describe('Расчет оплаты', () => {
    
    // Тест 1: Расчет скидк
    test('Корректный расчет скидки', () => {
        const calculateDiscount = (total, discountPercent) => {
            return total - (total * discountPercent / 100);
        };
        
        expect(calculateDiscount(10000, 10)).toBe(9000);
        expect(calculateDiscount(5000, 0)).toBe(5000);
        expect(calculateDiscount(20000, 25)).toBe(15000);
    });
    
    test('Расчет предоплаты (30% от суммы)', () => {
        const calculatePrepayment = (total) => {
            return total * 0.3;
        };
        
        expect(calculatePrepayment(10000)).toBe(3000);
        expect(calculatePrepayment(50000)).toBe(15000);
        expect(calculatePrepayment(0)).toBe(0);
    });
    
    test('Корректное форматирование цены', () => {
        const formatPrice = (price) => {
            return price.toLocaleString('ru-RU') + ' ₽';
        };
        
        expect(formatPrice(1000)).toContain('₽');
        expect(formatPrice(25000)).toContain('₽');
        expect(formatPrice(8900)).toContain('₽');
        
        expect(formatPrice(1000)).toMatch(/1\s?000/);
        expect(formatPrice(25000)).toMatch(/25\s?000/);
        expect(formatPrice(8900)).toMatch(/8\s?900/);
        
        expect(formatPrice(1000).length).toBeGreaterThan(5);
        expect(formatPrice(25000).length).toBeGreaterThan(5);
        expect(formatPrice(8900).length).toBeGreaterThan(5);
    });
});