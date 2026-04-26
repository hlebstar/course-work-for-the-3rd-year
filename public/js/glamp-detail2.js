const glampsData = [
            {
                id: 1,
                name: "Шале у леса",
                description: "Ваш уединенный уголок на опушке. Это шале — воплощение гармонии швейцарского уюта и русской природы. Просыпайтесь под пение птиц за окном, а вечером грейтесь у камина с чашкой травяного чая. Идеальное место, чтобы отключиться от суеты и насладиться тишиной и покоем.",
                price_per_night: 8900,
                max_guests: 2,
                amenities: ["Мангал", "Терраса", "WiFi", "Парковка"],
                images: [
                    "https://welcomekursk.ru/uploads/81a3416b9c945e9e4064d209930e1117.jpg",
                    "https://avatars.mds.yandex.net/get-altay/11371852/2a0000018c88ff80e731578b6f6776a25bf9/XXL_height",
                    "https://avatars.mds.yandex.net/i?id=3eb54f87da2f10b506a7fee74cced5d7_l-4577642-images-thumbs&n=13",
                    "https://cdn.worldota.net/t/1024x768/extranet/3b/98/3b98b23c7c2be013e73b9f655c8ac191c0af70df.JPEG"
                ],
                location: { city: "Красный Двор", address: "" },
                type: "house"
            },
            {
                id: 2,
                name: "Сфера",
                description: "Ваш современный уголок с панорамным видом на звездное небо. Этот геодезический купол сочетает футуристичный дизайн и полное единение с природой. Засыпайте под свет звезд, а днем наслаждайтесь уютом и необычной атмосферой. Идеально для романтического отдыха и новых впечатлений.",
                price_per_night: 12400,
                max_guests: 3,
                amenities: ["Панорамный вид", "Кондиционер", "WiFi", "Лежак"],
                images: [
                    "https://avatars.mds.yandex.net/get-altay/9724410/2a00000189a2c14aff7272401c3fa6a4d611/orig",
                    "https://avatars.mds.yandex.net/get-altay/9724410/2a00000189a2c14aff7272401c3fa6a4d611/orig",
                    "https://avatars.mds.yandex.net/get-altay/4454943/2a00000182a841c66f10a93067553b09b4e8/XXL_height",
                    "https://hotelidea.ru/wp-content/uploads/2025/08/holidays-forest.jpg"
                ],
                location: { city: "Красный Двор", address: "" },
                type: "tent"
            },
            {
                id: 3,
                name: "Шатёр",
                description: "Настоящее приключение с комфортом. Просторная палатка с кроватью и всем необходимым для отдыха после дня, полного открытий. Слушайте шелест листьев и пение птиц, не отказываясь от уюта. Отличный выбор для тех, кто ищет легкий и атмосферный формат глэмпинга.",
                price_per_night: 6800,
                max_guests: 4,
                amenities: ["Кухня", "Мангал", "WiFi"],
                images: [
                    "https://avatars.mds.yandex.net/i?id=236cd6d3c5bd3619a8a217d9b7425371_l-13280984-images-thumbs&n=13",
                    "https://n.cdn.cdek.shopping/images/shopping/W2DKh0xhIz5N5LLo.jpg?v=1",
                    "https://ir.ozone.ru/s3/multimedia-r/6555658659.jpg",
                    "https://thumbs.dreamstime.com/b/inside-glamping-tent-luxury-tent-inside-inside-glamping-tent-252962730.jpg"
                ],
                location: { city: "Красный Двор", address: "" },
                type: "house"
            },
            {
                id: 4,
                name: "Листовый покой",
                description: "Ваше убежище в глубине леса. Этот домик создан для тех, кто хочет полностью отключиться от забот и раствориться в природе. Тишина, покой и ощущение защищенности — здесь вы останетесь наедине с собой и лесными пейзажами.",
                price_per_night: 14500,
                max_guests: 6,
                amenities: ["Сауна", "Бильярд", "Камин", "WiFi"],
                images: [
                    "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800",
                    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
                    "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800",
                    "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800"
                ],
                location: { city: "Красный Двор", address: "" },
                type: "lodge"
            },
            {
                id: 5,
                name: "Лесная гавань",
                description: "Ваше убежище в глубине леса. Этот домик создан для тех, кто хочет полностью отключиться от забот и раствориться в природе. Тишина, покой и ощущение защищенности — здесь вы останетесь наедине с собой и лесными пейзажами.",
                price_per_night: 5200,
                max_guests: 2,
                amenities: ["Терраса", "WiFi", "Мангал"],
                images: [
                    "https://tripinglamp.ru/wp-content/uploads/2025/05/lesnayagavan-naturalnyy-0-1_28.jpg",
                    "https://avatars.mds.yandex.net/i?id=8f23be62c8510439e8ea22a64b314f4154389d53-6968661-images-thumbs&n=13",
                    "https://tripinglamp.ru/wp-content/uploads/2025/05/lesnayagavan-naturalnyy-0-0_27.jpg",
                    "https://avatars.mds.yandex.net/get-altay/14005436/2a00000192a9c646034b90546722f69221cf/orig"
                ],
                location: { city: "Красный Двор", address: "" },
                type: "tent"
            },
            {
                id: 6,
                name: "Избушка на опушке",
                description: "Сказочный домик из дерева с настоящей печкой или камином. Здесь пахнет лесом и уютом, а из окон открывается вид на зеленую опушку. Почувствуйте себя героем старой доброй сказки, где современный комфорт гармонично сочетается с духом традици",
                price_per_night: 4800,
                max_guests: 3,
                amenities: ["Русская печь", "Сад", "Тишина"],
                images: [
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
                    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
                    "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800",
                    "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800"
                ],
                location: { city: "Красный Двор", address: "" },
                type: "house"
            }
        ];

        let currentGlamp = null;
        let bookingData = null;
        let bookingNights = 0;

        function getBookingDataFromStorage() {
            const data = localStorage.getItem('glampingBooking');
            if (data) {
                try {
                    return JSON.parse(data);
                } catch(e) {
                    return null;
                }
            }
            return null;
        }

        function calculateNights(checkIn, checkOut) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        }

        function formatDate(dateString) {
            if (!dateString) return 'не выбрано';
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }

        function getGlampIdFromUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            return parseInt(urlParams.get('id'));
        }

        function displayGlampDetail() {
            const glampId = getGlampIdFromUrl();
            currentGlamp = glampsData.find(g => g.id === glampId);
            
            if (!currentGlamp) {
                window.location.href = '/glamps.html';
                return;
            }
            
            document.getElementById('glampTitle').textContent = currentGlamp.name;
            document.getElementById('glampDescription').textContent = currentGlamp.description;
            document.getElementById('glampLocation').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${currentGlamp.location.city}`;
            document.getElementById('glampPrice').innerHTML = `${currentGlamp.price_per_night.toLocaleString()} ₽ <small>/ночь</small>`;
            
            document.getElementById('mainImage').src = currentGlamp.images[0];
            document.getElementById('mainImage').alt = currentGlamp.name;
            
            const galleryGrid = document.getElementById('galleryGrid');
            galleryGrid.innerHTML = currentGlamp.images.map((img, index) => `
                <img src="${img}" class="gallery-img" alt="Фото ${index + 1}" onclick="changeMainImage('${img}')">
            `).join('');
            
            const featuresList = document.getElementById('featuresList');
            featuresList.innerHTML = currentGlamp.amenities.map(amenity => `
                <div class="feature-item">
                    <i class="fas fa-check-circle"></i>
                    <span>${amenity}</span>
                </div>
            `).join('');
        }

        function changeMainImage(imgSrc) {
            document.getElementById('mainImage').src = imgSrc;
        }

        function displayBookingInfo() {
            bookingData = getBookingDataFromStorage();
            const bookingInfoDiv = document.getElementById('bookingInfoDetail');
            
            if (bookingData && bookingData.checkIn && bookingData.checkOut) {
                bookingNights = calculateNights(bookingData.checkIn, bookingData.checkOut);
                
                if (bookingData.guests > currentGlamp.max_guests) {
                    bookingInfoDiv.innerHTML = `
                        <div class="warning-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>Внимание!</strong> Этот домик рассчитан максимум на ${currentGlamp.max_guests} гостей.<br>
                            Вы выбрали ${bookingData.guests} гостей.
                        </div>
                    `;
                    return;
                }
                
                const totalPrice = currentGlamp.price_per_night * bookingNights;
                bookingInfoDiv.innerHTML = `
                    <div class="date-info">
                        <span><i class="fas fa-calendar-check"></i> Заезд:</span>
                        <strong>${formatDate(bookingData.checkIn)}</strong>
                    </div>
                    <div class="date-info">
                        <span><i class="fas fa-calendar-times"></i> Выезд:</span>
                        <strong>${formatDate(bookingData.checkOut)}</strong>
                    </div>
                    <div class="date-info">
                        <span><i class="fas fa-users"></i> Гостей:</span>
                        <strong>${bookingData.guests}</strong>
                    </div>
                    <div class="date-info">
                        <span><i class="fas fa-moon"></i> Ночей:</span>
                        <strong>${bookingNights}</strong>
                    </div>
                    <div class="total-price-display">
                        <div>Общая стоимость</div>
                        <div class="total-amount">${totalPrice.toLocaleString()} ₽</div>
                    </div>
                `;
            } else {
                bookingInfoDiv.innerHTML = `
                    <div class="warning-message">
                        <i class="fas fa-info-circle"></i> Для бронирования выберите даты на главной странице.
                    </div>
                `;
            }
        }

        // Кнопка "Продолжить бронирование"
        document.getElementById('continueBookingBtn').addEventListener('click', function() {
            if (!bookingData || !bookingData.checkIn || !bookingData.checkOut) {
                alert('Пожалуйста, сначала выберите даты на главной странице');
                window.location.href = '/';
                return;
            }
            
            if (bookingData.guests > currentGlamp.max_guests) {
                alert(`Этот домик рассчитан максимум на ${currentGlamp.max_guests} гостей. Вы выбрали ${bookingData.guests}. Пожалуйста, выберите другой домик.`);
                window.location.href = '/glamps.html';
                return;
            }
            
            localStorage.setItem('selectedGlamp', JSON.stringify({
                id: currentGlamp.id,
                name: currentGlamp.name,
                price_per_night: currentGlamp.price_per_night,
                max_guests: currentGlamp.max_guests,
                description: currentGlamp.description,
                location: currentGlamp.location,
                images: currentGlamp.images,
                amenities: currentGlamp.amenities
            }));
            
            if (bookingData) {
                localStorage.setItem('glampingBooking', JSON.stringify(bookingData));
            }
            
            window.location.href = '/booking.html';
        });

        document.addEventListener('DOMContentLoaded', function() {
            displayGlampDetail();
            displayBookingInfo();
        });
        
        window.changeMainImage = changeMainImage;