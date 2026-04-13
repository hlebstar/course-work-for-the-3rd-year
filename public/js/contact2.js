  let selectedRating = 0;
        
        function setRating(rating) {
            selectedRating = rating;
            document.getElementById('revRating').value = rating;
            const stars = document.querySelectorAll('#ratingStars span');
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.innerHTML = '★';
                    star.style.color = '#ffc107';
                } else {
                    star.innerHTML = '☆';
                    star.style.color = '#ffc107';
                }
            });
        }
        
        async function loadReviews() {
            try {
                const statsRes = await fetch('/api/reviews/stats');
                const stats = await statsRes.json();
                
                if (stats.success) {
                    document.getElementById('reviewsStats').innerHTML = `
                        Средняя оценка: <strong>${stats.data.avgRating}</strong> ★ &nbsp;|&nbsp; <strong>${stats.data.total}</strong> отзывов
                    `;
                }
                
                const res = await fetch('/api/reviews');
                const result = await res.json();
                
                if (result.success && result.data.length > 0) {
                    document.getElementById('reviewsList').innerHTML = result.data.map(review => `
                        <div class="review-card">
                            <div class="review-name">${escapeHtml(review.user_name)}</div>
                            <div class="review-text">${escapeHtml(review.review_text)}</div>
                            <div class="review-date">${new Date(review.created_at).toLocaleDateString('ru-RU')}</div>
                            <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
                        </div>
                    `).join('');
                } else {
                    document.getElementById('reviewsList').innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.5);">Пока нет отзывов. Будьте первым!</div>';
                }
            } catch (error) {
                console.error('Ошибка:', error);
            }
        }
        
        function openReviewForm() {
            document.getElementById('reviewModal').style.display = 'flex';
        }
        
        function closeReviewForm() {
            document.getElementById('reviewModal').style.display = 'none';
            document.getElementById('reviewForm').reset();
            selectedRating = 0;
            document.getElementById('revRating').value = '';
            const stars = document.querySelectorAll('#ratingStars span');
            stars.forEach(star => {
                star.innerHTML = '☆';
                star.style.color = '#ffc107';
            });
        }
        
        document.getElementById('reviewForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const rating = parseInt(document.getElementById('revRating').value);
            if (!rating) {
                alert('Поставьте оценку звездами!');
                return;
            }
            
            const reviewData = {
                user_name: document.getElementById('revName').value,
                user_email: document.getElementById('revEmail').value,
                rating: rating,
                review_text: document.getElementById('revText').value,
                glamp_id: null
            };
            
            try {
                const res = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reviewData)
                });
                const result = await res.json();
                
                if (result.success) {
                    alert(' Спасибо за отзыв!');
                    closeReviewForm();
                    loadReviews();
                } else {
                    alert('Ошибка: ' + result.error);
                }
            } catch (error) {
                alert('Ошибка при отправке');
            }
        });
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        loadReviews();