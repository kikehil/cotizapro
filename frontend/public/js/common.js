const ui = {
    setTitle(title) {
        document.getElementById('page-title').innerText = title;
        document.title = `${title} | CotizaPro`;
    },
    updateUserInfo() {
        const user = auth.getUser();
        if (user) {
            document.getElementById('user-name').innerText = user.nombre;
        }
    },
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    },
    formatDate(date) {
        return new Date(date).toLocaleDateString('es-MX');
    },
    showLoading() {
        Swal.fire({
            title: 'Cargando...',
            didOpen: () => {
                Swal.showLoading()
            },
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false
        });
    },
    hideLoading() {
        Swal.close();
    },
    toast(message, icon = 'success') {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
        Toast.fire({
            icon: icon,
            title: message
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ui.updateUserInfo();
    
    // Highlight active sidebar item
    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar-item').forEach(item => {
        if (item.getAttribute('href') === currentPath) {
            item.classList.add('sidebar-item-active');
        }
    });
});







