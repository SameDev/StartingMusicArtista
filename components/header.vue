<template>
    <div class="2xl:ml-0 ml-12  w-full h-[9vh] flex justify-between items-center py-2 z-20">
        <div class="items-center text-3xl hidden sm:flex">
            <font-awesome-icon :icon="['fas', icon]" class="mr-2" /> 
            <h2 class="font-nunit font-bold text-3xl mt-1">{{ page }}</h2>
        </div>
        <div class="flex justify-center align-middle items-center p-2 text-2xl ">
            <div class="md:mr-5 text-end">
                <h2 class="font-bold font-roboto md:text-xl text-sm">{{ userNome }}</h2>
                <h2 class="font-roboto text-sm font-medium text-accent">{{ userCargo }}</h2>
            </div>
            <div class="dropdown dropdown-hover dropdown-end 2xl:mr-0 sm:mr-5 mr-10 align-middle">
                <div tabindex="0" role="button" class="avatar mr-2 shadow-2xl">
                    <div class="w-16 rounded-full shadow-2xl">
                        <img :src="getUserImage(userPic)" :alt="userNome+' | Imagem do artista'" />
                    </div>
                </div>
                <ul tabindex="0" class="dropdown-content z-[1] menu shadow p-0 bg-secondary rounded-md w-52">
                    <li><nuxt-link to="/editar-perfil" class="cursor-pointer">
                        <font-awesome-icon :icon="['fas', 'user-gear']" /> Configurar perfil
                    </nuxt-link></li>
                    <li><div class="cursor-pointer" @click="loggout">
                        <font-awesome-icon :icon="['fas', 'user-xmark']" /> Sair
                    </div></li>
                </ul>
            </div>
            
        </div>
    </div>
</template>

<script lang="ts">
export default {
    data() {
        return {
            userPic: "",
            userNome: "",
            userCargo: ""
        }
    },
    beforeMount() {
        if (process.client) {
            this.userPic = localStorage.getItem("userPic") || ""
            this.userNome = localStorage.getItem("userNome") || ""
            this.userCargo = useCookie("cargoUser").value || ""
        }
    },
    methods: {
        loggout() {
            const cookie = useCookie('jwtToken');
            cookie.value = "";

            localStorage.clear();

            this.$router.push('/').then(() => window.location.reload());
        },
        getUserImage(imageSrc: string): string {
            if (!imageSrc || imageSrc === "null") {
                return "/user-placeholder.jpeg";
            }

            return imageSrc;
        },
    },
    props: [
        "page",
        "icon"
    ]
}
</script>