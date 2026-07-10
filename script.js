// ============================================================
// 1. Загрузка данных о марках и моделях
// ============================================================

let brandsData = {};
let currentBrandId = null;
let currentBrandKey = null;

// Загружаем данные из JSON-файла
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Не удалось загрузить данные');
        brandsData = await response.json();
        console.log('✅ Данные загружены:', Object.keys(brandsData.brands).length, 'марок');
        return true;
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
        showError('Не удалось загрузить данные. Попробуйте позже.');
        return false;
    }
}

// ============================================================
// 2. Заполнение списка марок
// ============================================================

function populateBrands() {
    const select = document.getElementById('brandSelect');
    select.innerHTML = '<option value="">Выберите марку</option>';
    
    // Сортируем марки по названию
    const sortedBrands = Object.keys(brandsData.brands).sort((a, b) => {
        return brandsData.brands[a].name.localeCompare(brandsData.brands[b].name);
    });
    
    for (const key of sortedBrands) {
        const brand = brandsData.brands[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = brand.name;
        select.appendChild(option);
    }
}

// ============================================================
// 3. Обработка выбора марки
// ============================================================

document.getElementById('brandSelect').addEventListener('change', function() {
    const brandKey = this.value;
    const modelSelect = document.getElementById('modelSelect');
    const priceFrom = document.getElementById('priceFrom');
    const priceTo = document.getElementById('priceTo');
    const yearFrom = document.getElementById('yearFrom');
    const yearTo = document.getElementById('yearTo');
    
    if (!brandKey) {
        modelSelect.disabled = true;
        modelSelect.innerHTML = '<option value="">Сначала выберите марку</option>';
        currentBrandId = null;
        currentBrandKey = null;
        return;
    }
    
    currentBrandKey = brandKey;
    currentBrandId = brandsData.brands[brandKey].id;
    
    // Заполняем модели
    const models = brandsData.brands[brandKey].models;
    modelSelect.disabled = false;
    modelSelect.innerHTML = '<option value="">Выберите модель</option>';
    
    const sortedModels = Object.keys(models).sort((a, b) => {
        return models[a].name.localeCompare(models[b].name);
    });
    
    for (const modelKey of sortedModels) {
        const model = models[modelKey];
        const option = document.createElement('option');
        option.value = modelKey;
        option.textContent = model.name;
        modelSelect.appendChild(option);
    }
});

// ============================================================
// 4. Обработка отправки формы
// ============================================================

document.getElementById('filterForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const brandSelect = document.getElementById('brandSelect');
    const modelSelect = document.getElementById('modelSelect');
    const priceFrom = document.getElementById('priceFrom');
    const priceTo = document.getElementById('priceTo');
    const yearFrom = document.getElementById('yearFrom');
    const yearTo = document.getElementById('yearTo');
    const region = document.getElementById('region');
    const submitBtn = document.getElementById('submitBtn');
    const errorDiv = document.getElementById('errorMessage');
    
    // Скрываем старые ошибки
    errorDiv.classList.remove('show');
    errorDiv.style.display = 'none';
    
    // Проверка: выбрана ли марка
    const brandKey = brandSelect.value;
    if (!brandKey) {
        showError('Пожалуйста, выберите марку');
        return;
    }
    
    // Проверка: выбрана ли модель
    const modelKey = modelSelect.value;
    if (!modelKey) {
        showError('Пожалуйста, выберите модель');
        return;
    }
    
    // Получаем коды
    const brandId = brandsData.brands[brandKey].id;
    const modelId = brandsData.brands[brandKey].models[modelKey].id;
    
    // Собираем ссылку
    let url = `https://cars.av.by/filter?brands[0][brand]=${brandId}&brands[0][model]=${modelId}`;
    
    // Добавляем цену
    const priceFromVal = priceFrom.value.trim();
    const priceToVal = priceTo.value.trim();
    if (priceFromVal && parseInt(priceFromVal) >= 0) {
        url += `&price_from=${priceFromVal}`;
    }
    if (priceToVal && parseInt(priceToVal) > 0) {
        url += `&price_to=${priceToVal}`;
    }
    
    // Добавляем год
    const yearFromVal = yearFrom.value.trim();
    const yearToVal = yearTo.value.trim();
    if (yearFromVal && parseInt(yearFromVal) >= 1980) {
        url += `&year_from=${yearFromVal}`;
    }
    if (yearToVal && parseInt(yearToVal) >= 1980) {
        url += `&year_to=${yearToVal}`;
    }
    
    // Добавляем регион
    const regionVal = region.value;
    if (regionVal) {
        url += `&region=${regionVal}`;
    }
    
    // Сортировка: сначала новые
    url += `&sort=4`;
    
    // Показываем состояние загрузки
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Собираю ссылку...';
    
    try {
        // Получаем информацию о Telegram WebApp
        const tg = window.Telegram.WebApp;
        
        // Если мы в Telegram, отправляем данные через WebApp
        if (tg) {
            // Отправляем ссылку в бота
            tg.sendData(JSON.stringify({
                action: 'track',
                url: url,
                brand: brandsData.brands[brandKey].name,
                model: brandsData.brands[brandKey].models[modelKey].name
            }));
            
            // Закрываем мини-приложение
            tg.close();
        } else {
            // Если запущено в браузере (для отладки)
            console.log('🔗 Ссылка для /track:', url);
            alert('Ссылка скопирована в консоль (для отладки)');
            
            // Открываем ссылку в новой вкладке для проверки
            window.open(url, '_blank');
        }
        
    } catch (error) {
        console.error('❌ Ошибка отправки:', error);
        showError('Ошибка при отправке. Попробуйте ещё раз.');
        submitBtn.disabled = false;
        submitBtn.textContent = '🎯 Начать охоту';
    }
});

// ============================================================
// 5. Вспомогательные функции
// ============================================================

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = '❌ ' + message;
    errorDiv.style.display = 'block';
    errorDiv.classList.add('show');
}

// ============================================================
// 6. Инициализация
// ============================================================

async function init() {
    // Настраиваем Telegram WebApp
    const tg = window.Telegram.WebApp;
    if (tg) {
        tg.ready();
        tg.expand();
        console.log('✅ Telegram WebApp инициализирован');
    }
    
    // Загружаем данные
    const loaded = await loadData();
    if (loaded) {
        populateBrands();
        console.log('✅ Мини-приложение готово');
    }
}

// Запускаем
document.addEventListener('DOMContentLoaded', init);
