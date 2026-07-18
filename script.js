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
        if (!response.ok) {
            console.error(`❌ Ошибка загрузки: HTTP ${response.status}`);
            throw new Error('Не удалось загрузить данные');
        }
        const data = await response.json();
        console.log('📦 Полученные данные:', data);
        
        if (!data.brands) {
            console.error('❌ В данных нет поля "brands"');
            throw new Error('Некорректная структура данных');
        }
        
        brandsData = data;
        console.log('✅ Данные загружены:', Object.keys(brandsData.brands).length, 'марок');
        return true;
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
        showError('Не удалось загрузить данные. Попробуйте позже.');
        return false;
    }
}

// ============================================================
// 2. Вспомогательная функция для безопасного получения названия
// ============================================================

function getItemName(item, defaultName) {
    if (!item) return defaultName;
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item.name) return item.name;
    return defaultName;
}

function getItemId(item) {
    if (!item) return null;
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item.id) return item.id;
    return null;
}

// ============================================================
// 3. Заполнение списка марок
// ============================================================

function populateBrands() {
    const select = document.getElementById('brandSelect');
    if (!select) {
        console.error('❌ Не найден элемент brandSelect');
        return;
    }
    
    select.innerHTML = '<option value="">Выберите марку</option>';
    
    if (!brandsData.brands || Object.keys(brandsData.brands).length === 0) {
        console.error('❌ Нет данных для заполнения марок');
        return;
    }
    
    // Сортируем марки по названию
    const sortedBrands = Object.keys(brandsData.brands).sort((a, b) => {
        const nameA = getItemName(brandsData.brands[a], a);
        const nameB = getItemName(brandsData.brands[b], b);
        return nameA.localeCompare(nameB);
    });
    
    console.log('🔄 Заполняю марки:', sortedBrands.length);
    
    for (const key of sortedBrands) {
        const brand = brandsData.brands[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = getItemName(brand, key);
        select.appendChild(option);
    }
}

// ============================================================
// 4. Обработка выбора марки
// ============================================================

document.getElementById('brandSelect').addEventListener('change', function() {
    const brandKey = this.value;
    const modelSelect = document.getElementById('modelSelect');
    
    console.log('🔍 Выбрана марка:', brandKey);
    
    if (!brandKey) {
        modelSelect.disabled = true;
        modelSelect.innerHTML = '<option value="">Сначала выберите марку</option>';
        currentBrandId = null;
        currentBrandKey = null;
        return;
    }
    
    const brand = brandsData.brands[brandKey];
    if (!brand) {
        console.error('❌ Марка не найдена:', brandKey);
        return;
    }
    
    currentBrandKey = brandKey;
    currentBrandId = getItemId(brand);
    
    console.log('📌 ID марки:', currentBrandId);
    console.log('📌 Данные марки:', brand);
    
    // Проверяем, есть ли модели
    if (!brand.models) {
        console.warn('⚠️ У марки нет поля models');
        modelSelect.disabled = true;
        modelSelect.innerHTML = '<option value="">Нет моделей для этой марки</option>';
        return;
    }
    
    const modelKeys = Object.keys(brand.models);
    if (modelKeys.length === 0) {
        modelSelect.disabled = true;
        modelSelect.innerHTML = '<option value="">Нет моделей для этой марки</option>';
        return;
    }
    
    modelSelect.disabled = false;
    modelSelect.innerHTML = '<option value="">Выберите модель</option>';
    
    // Сортируем модели по названию
    const sortedModels = modelKeys.sort((a, b) => {
        const modelA = brand.models[a];
        const modelB = brand.models[b];
        const nameA = getItemName(modelA, a);
        const nameB = getItemName(modelB, b);
        return nameA.localeCompare(nameB);
    });
    
    console.log('🔄 Заполняю модели:', sortedModels.length);
    
    for (const modelKey of sortedModels) {
        const model = brand.models[modelKey];
        const option = document.createElement('option');
        option.value = modelKey;
        option.textContent = getItemName(model, modelKey);
        modelSelect.appendChild(option);
    }
});

// ============================================================
// 5. Обработка отправки формы
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
    
    errorDiv.classList.remove('show');
    errorDiv.style.display = 'none';
    
    const brandKey = brandSelect.value;
    if (!brandKey) {
        showError('Пожалуйста, выберите марку');
        return;
    }
    
    const modelKey = modelSelect.value;
    if (!modelKey) {
        showError('Пожалуйста, выберите модель');
        return;
    }
    
    const brand = brandsData.brands[brandKey];
    if (!brand) {
        showError('Ошибка: марка не найдена');
        return;
    }
    
    const model = brand.models[modelKey];
    if (!model) {
        showError('Ошибка: модель не найдена');
        return;
    }
    
    const brandId = getItemId(brand);
    const modelId = getItemId(model);
    
    if (!brandId || !modelId) {
        showError('Ошибка: не удалось получить ID марки или модели');
        return;
    }
    
    const brandName = getItemName(brand, brandKey);
    const modelName = getItemName(model, modelKey);
    
    console.log('🔗 Формирую ссылку для:', brandName, modelName);
    console.log('   brandId:', brandId, 'modelId:', modelId);
    
    let url = `https://cars.av.by/filter?brands[0][brand]=${brandId}&brands[0][model]=${modelId}`;
    
    const priceFromVal = priceFrom.value.trim();
    const priceToVal = priceTo.value.trim();
    if (priceFromVal && parseInt(priceFromVal) >= 0) {
        url += `&price_from=${priceFromVal}`;
    }
    if (priceToVal && parseInt(priceToVal) > 0) {
        url += `&price_to=${priceToVal}`;
    }
    
    const yearFromVal = yearFrom.value.trim();
    const yearToVal = yearTo.value.trim();
    if (yearFromVal && parseInt(yearFromVal) >= 1980) {
        url += `&year_from=${yearFromVal}`;
    }
    if (yearToVal && parseInt(yearToVal) >= 1980) {
        url += `&year_to=${yearToVal}`;
    }
    
    const regionVal = region.value;
    if (regionVal) {
        url += `&region=${regionVal}`;
    }
    
    url += `&sort=4`;
    
    console.log('✅ Готовая ссылка:', url);
    
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Собираю ссылку...';
    
    try {
        const tg = window.Telegram.WebApp;
        
        if (tg) {
            tg.sendData(JSON.stringify({
                action: 'track',
                url: url,
                brand: brandName,
                model: modelName
            }));
            tg.close();
        } else {
            console.log('🔗 Ссылка для /track:', url);
            alert(`Ссылка готова!\n\n${url}\n\nСкопируйте и отправьте боту команду /track`);
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
// 6. Вспомогательные функции
// ============================================================

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = '❌ ' + message;
    errorDiv.style.display = 'block';
    errorDiv.classList.add('show');
}

// ============================================================
// 7. Инициализация
// ============================================================

async function init() {
    console.log('🚀 Инициализация мини-приложения...');
    
    const tg = window.Telegram.WebApp;
    if (tg) {
        tg.ready();
        tg.expand();
        console.log('✅ Telegram WebApp инициализирован');
    }
    
    const loaded = await loadData();
    if (loaded) {
        populateBrands();
        console.log('✅ Мини-приложение готово');
    } else {
        console.error('❌ Не удалось загрузить данные');
        showError('Не удалось загрузить данные. Проверьте файл data.json');
    }
}

// Запускаем
document.addEventListener('DOMContentLoaded', init);