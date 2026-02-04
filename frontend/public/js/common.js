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
    },
    toggleSidebar() {
        const layout = document.getElementById('app-layout');
        layout.classList.toggle('sidebar-collapsed');
        document.body.classList.toggle('sidebar-open');
    },
    closeSidebarIfOutside(event) {
        const layout = document.getElementById('app-layout');
        const sidebar = document.getElementById('sidebar-container');
        
        // Solo contraer si no está colapsado y el click fue fuera del botón de toggle
        if (!layout.classList.contains('sidebar-collapsed') && 
            !sidebar.contains(event.target) && 
            !event.target.closest('button[onclick="ui.toggleSidebar()"]')) {
            layout.classList.add('sidebar-collapsed');
            document.body.classList.remove('sidebar-open');
        }
    },
    initInactivityTimer() {
        let timer;
        const timeout = 20 * 60 * 1000; // 20 minutos

        const resetTimer = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                ui.toast('Sesión cerrada por inactividad', 'info');
                setTimeout(() => auth.logout(), 1500);
            }, timeout);
        };

        // Eventos que reinician el contador
        window.onload = resetTimer;
        document.onmousemove = resetTimer;
        document.onkeypress = resetTimer;
        document.onclick = resetTimer;
        document.onscroll = resetTimer;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ui.updateUserInfo();
    ui.initInactivityTimer();
    
    // Highlight active sidebar item
    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar-item').forEach(item => {
        if (item.getAttribute('href') === currentPath) {
            item.classList.add('sidebar-item-active');
        }
    });
});







