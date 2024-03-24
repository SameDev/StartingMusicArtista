import { jwtDecode } from "jwt-decode";

// Variável para armazenar se o redirecionamento já foi tratado
let redirectHandled = false;

export default defineNuxtRouteMiddleware(async ({ route }) => {
  try {
    // Se o redirecionamento já foi tratado, não fazer nada
    if (redirectHandled) {
      return;
    }

    const jwtToken = useCookie("jwtToken").value as string;

    // Se não houver token JWT e não estiver na página de login, redirecionar para a página de login
    if (!jwtToken && route && route.path !== '/login') {
      redirectHandled = true;
      return { path: '/login' };
    }

    // Se estiver na página inicial e não estiver logado, não redirecionar para /login
    if (!jwtToken && route && route.path === '/') {
      redirectHandled = true;
      return;
    }

    // Se houver token JWT e estiver na página de login, redirecionar para a raiz
    if (jwtToken && route && route.path === '/login') {
      redirectHandled = true;
      return { path: '/' };
    }

    // Se houver token JWT, definir o cargo do usuário no cookie
    if (jwtToken) {
      const decodedToken: { id: number, cargo: string } = jwtDecode(jwtToken);
      if (decodedToken && decodedToken.cargo) {
        const cargoCookie = useCookie('cargoUser', {
          maxAge: 8 * 60 * 60,
          secure: true,
          sameSite: true
        });
        cargoCookie.value = decodedToken.cargo;
      }
    }

    // Marcar o redirecionamento como tratado
    redirectHandled = true;
  } catch(error) {
    console.log(error);
    // Em caso de erro, limpar cookies e localStorage apenas se o usuário não estiver na página inicial
    if (route && route.path !== '/') {
      useCookie("jwtToken").value = "";
      useCookie("cargoUser").value = "";
      localStorage.clear();
      redirectHandled = true;
      return { path: '/login' };
    }
  }
});
