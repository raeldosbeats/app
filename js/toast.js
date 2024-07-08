function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon;
    switch(type) {
      case 'success':
        icon = '<i class="fas fa-check-circle"></i>';
        break;
      case 'error':
        icon = '<i class="fas fa-times-circle"></i>';
        break;
      case 'info':
        icon = '<i class="fas fa-info-circle"></i>';
        break;
      case 'warning':
        icon = '<i class="fas fa-exclamation-circle"></i>';
        break;
    }
    
    notification.innerHTML = `${icon} ${message} <span class="close-btn"><i class="fas fa-times"></i></span>`;
    document.body.appendChild(notification);
    
    const closeBtn = notification.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }