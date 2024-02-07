import { jwtDecode } from "jwt-decode";

export default defineNuxtRouteMiddleware((to, _from) => {
  const jwtToken = useCookie("jwtToken").value as string;

  if (!jwtToken && to.path !== '/login') {
    return { path: '/login' };
  }

  if (jwtToken && to.path === '/login') {
    return { path: '/' };
  }

  if (jwtToken) {
    const decodedToken: { id: number, cargo: string } = jwtDecode(jwtToken);
    if (decodedToken && decodedToken.cargo) {
      const cargoCookie = useCookie('cargoUser', {
        maxAge: 8 * 60 * 60,
        secure: true,
        sameSite: true
      });
      cargoCookie.value = decodedToken.cargo
    }
  }
});