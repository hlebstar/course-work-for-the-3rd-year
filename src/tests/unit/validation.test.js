describe('Валидация формы бронирования', () => {
    
    test('Корректная валидация email', () => {
        const isValidEmail = (email) => {
            const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
            return emailRegex.test(email);
        };
        
        expect(isValidEmail('user@example.com')).toBe(true);
        expect(isValidEmail('user@mail.ru')).toBe(true);
        expect(isValidEmail('invalid-email')).toBe(false);
        expect(isValidEmail('user@')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
    });
    
    test('Корректная валидация телефона', () => {
        const isValidPhone = (phone) => {
            const phoneRegex = /^[\+\(\s]?\d[\s\)]?\d[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
            return phone.length >= 10;
        };
        
        expect(isValidPhone('+79991234567')).toBe(true);
        expect(isValidPhone('89123456789')).toBe(true);
        expect(isValidPhone('123')).toBe(false);
        expect(isValidPhone('')).toBe(false);
    });
    
    test('Количество гостей не превышает вместимость домика', () => {
        const isGuestsValid = (guests, maxGuests) => {
            return guests > 0 && guests <= maxGuests;
        };
        
        expect(isGuestsValid(2, 4)).toBe(true);
        expect(isGuestsValid(4, 4)).toBe(true);
        expect(isGuestsValid(5, 4)).toBe(false);
        expect(isGuestsValid(0, 4)).toBe(false);
    });
});