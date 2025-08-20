// Shakespeare Play Analyzer - Main JavaScript Application

// Global variables
let currentAnalysisType = null;
let loadingModal = null;
let playSelectorModal = null;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeModals();
    initializeTooltips();
    initializeAnimations();
    
    // Add loading states to all buttons
    addLoadingStates();
    
    console.log('Shakespeare Play Analyzer initialized');
});

// Initialize Bootstrap modals
function initializeModals() {
    const loadingModalElement = document.getElementById('loadingModal');
    const playSelectorModalElement = document.getElementById('playSelectorModal');
    
    if (loadingModalElement) {
        loadingModal = new bootstrap.Modal(loadingModalElement, {
            backdrop: 'static',
            keyboard: false
        });
    }
    
    if (playSelectorModalElement) {
        playSelectorModal = new bootstrap.Modal(playSelectorModalElement);
    }
}

// Initialize tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Initialize animations
function initializeAnimations() {
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
    
    // Add slide-in animations to navigation items
    const navItems = document.querySelectorAll('.navbar-nav .nav-item');
    navItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('slide-in-left');
    });
}

// Add loading states to buttons
function addLoadingStates() {
    const buttons = document.querySelectorAll('button[onclick], a[href*="/characters/"], a[href*="/words/"]');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.classList.contains('btn-outline-primary') || 
                this.classList.contains('btn-outline-success') ||
                this.classList.contains('btn-outline-info')) {
                
                showButtonLoading(this);
                
                // Remove loading state after 3 seconds (fallback)
                setTimeout(() => {
                    hideButtonLoading(this);
                }, 3000);
            }
        });
    });
}

// Show button loading state
function showButtonLoading(button) {
    const originalText = button.innerHTML;
    button.setAttribute('data-original-text', originalText);
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Loading...';
    button.disabled = true;
}

// Hide button loading state
function hideButtonLoading(button) {
    const originalText = button.getAttribute('data-original-text');
    if (originalText) {
        button.innerHTML = originalText;
        button.disabled = false;
        button.removeAttribute('data-original-text');
    }
}

// Show play selector modal
function showPlaySelector(analysisType) {
    currentAnalysisType = analysisType;
    
    if (playSelectorModal) {
        playSelectorModal.show();
    } else {
        // Fallback if modal is not available
        const playIndex = prompt('Enter play index (0-based):');
        if (playIndex !== null && !isNaN(playIndex)) {
            selectPlay(parseInt(playIndex), 'Selected Play');
        }
    }
}

// Select play from modal
function selectPlay(playIndex, playName) {
    if (playSelectorModal) {
        playSelectorModal.hide();
    }
    
    if (currentAnalysisType) {
        showLoadingModal();
        
        // Navigate to the appropriate analysis page
        setTimeout(() => {
            window.location.href = `/${currentAnalysisType}/${playIndex}`;
        }, 500);
    }
}

// Show loading modal
function showLoadingModal() {
    if (loadingModal) {
        loadingModal.show();
    }
}

// Hide loading modal
function hideLoadingModal() {
    if (loadingModal) {
        loadingModal.hide();
    }
}

// Utility functions for API calls
async function fetchPlayData(playIndex) {
    try {
        showLoadingModal();
        const response = await fetch(`/api/play/${playIndex}`);
        const data = await response.json();
        hideLoadingModal();
        
        if (data.error) {
            showError('Error loading play data: ' + data.error);
            return null;
        }
        
        return data;
    } catch (error) {
        hideLoadingModal();
        showError('Network error: ' + error.message);
        return null;
    }
}

// Show error message
function showError(message) {
    const alertHtml = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Insert at the top of the main container
    const container = document.querySelector('main.container-fluid');
    if (container) {
        container.insertAdjacentHTML('afterbegin', alertHtml);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = container.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }
}

// Show success message
function showSuccess(message) {
    const alertHtml = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const container = document.querySelector('main.container-fluid');
    if (container) {
        container.insertAdjacentHTML('afterbegin', alertHtml);
        
        setTimeout(() => {
            const alert = container.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 3000);
    }
}

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Calculate percentage
function calculatePercentage(part, total) {
    if (total === 0) return 0;
    return ((part / total) * 100).toFixed(1);
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showSuccess('Copied to clipboard!');
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccess('Copied to clipboard!');
    }
}

// Download data as file
function downloadData(data, filename, type = 'application/json') {
    const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Smooth scroll to element
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Chart color palettes
const chartColors = {
    primary: ['#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8'],
    pastel: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFD1BA', '#E1BAFF', '#FFBAE1', '#C9FFBA', '#BAD1FF', '#FFBAFF'],
    dark: ['#343a40', '#495057', '#6c757d', '#adb5bd', '#ced4da', '#dee2e6', '#e9ecef', '#f8f9fa', '#ffffff', '#000000']
};

// Get chart colors
function getChartColors(count, palette = 'primary') {
    const colors = chartColors[palette] || chartColors.primary;
    const result = [];
    
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    
    return result;
}

// Local storage helpers
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.warn('Could not save to localStorage:', error);
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.warn('Could not load from localStorage:', error);
        return null;
    }
}

// Theme management
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    
    if (isDark) {
        body.classList.remove('dark-theme');
        saveToLocalStorage('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        saveToLocalStorage('theme', 'dark');
    }
}

// Initialize theme
function initializeTheme() {
    const savedTheme = loadFromLocalStorage('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-theme');
    }
}

// Performance monitoring
function measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showError('An unexpected error occurred. Please refresh the page and try again.');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showError('A network error occurred. Please check your connection and try again.');
});

// Export functions for use in other scripts
window.ShakespeareAnalyzer = {
    showPlaySelector,
    selectPlay,
    showLoadingModal,
    hideLoadingModal,
    showError,
    showSuccess,
    fetchPlayData,
    formatNumber,
    calculatePercentage,
    copyToClipboard,
    downloadData,
    scrollToElement,
    getChartColors,
    saveToLocalStorage,
    loadFromLocalStorage,
    toggleTheme,
    measurePerformance
};
