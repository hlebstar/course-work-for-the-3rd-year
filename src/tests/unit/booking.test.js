describe('Расчет стоимости бронирования', () => {
    
    test('Корректный расчет количества ночей между датами', () => {
        const calculateNights = (checkIn, checkOut) => {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            const diffTime = Math.abs(end - start);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        };
        
        expect(calculateNights('2025-04-10', '2025-04-12')).toBe(2);
        expect(calculateNights('2025-04-10', '2025-04-15')).toBe(5);
        expect(calculateNights('2025-04-10', '2025-04-10')).toBe(0);
        expect(calculateNights('2025-04-10', '2025-04-11')).toBe(1);
    });
    
    test('Корректный расчет общей стоимости с учетом услуг', () => {
        const calculateTotal = (pricePerNight, nights, services) => {
            const glampTotal = pricePerNight * nights;
            const servicesTotal = services.reduce((sum, s) => sum + s.price, 0);
            return glampTotal + servicesTotal;
        };
        
        const services = [{ price: 2500 }, { price: 1500 }];
        
        expect(calculateTotal(8900, 2, services)).toBe(8900 * 2 + 4000);
        expect(calculateTotal(12400, 3, [])).toBe(37200);
        expect(calculateTotal(6800, 1, [{ price: 1000 }])).toBe(7800);
        expect(calculateTotal(5000, 7, [{ price: 500 }, { price: 300 }])).toBe(5000 * 7 + 800);
    });
    
    test('Валидация дат: выезд должен быть позже заезда', () => {
        const isValidDates = (checkIn, checkOut) => {
            return new Date(checkOut) > new Date(checkIn);
        };
        
        expect(isValidDates('2025-04-10', '2025-04-12')).toBe(true);
        expect(isValidDates('2025-04-10', '2025-04-10')).toBe(false);
        expect(isValidDates('2025-04-12', '2025-04-10')).toBe(false);
        expect(isValidDates('2025-04-10', '2025-05-01')).toBe(true);
    });
    
    test('Расчет с учетом разных тарифов (выходные дороже)', () => {
        const getPriceWithWeekend = (basePrice, checkIn, checkOut) => {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            let total = 0;
            let current = new Date(start);
            while (current < end) {
                const day = current.getDay();
                if (day === 5 || day === 6) { 
                    total += basePrice * 1.3;
                } else {
                    total += basePrice;
                }
                current.setDate(current.getDate() + 1);
            }
            return Math.round(total);
        };
        
        expect(getPriceWithWeekend(1000, '2025-04-10', '2025-04-12')).toBe(1000 + 1300); // чт+пт
        expect(getPriceWithWeekend(1000, '2025-04-12', '2025-04-14')).toBe(1300 + 1000); // сб+вс
    });
});