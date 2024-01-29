<template>
    <div class="w-full h-[9vh] flex justify-between items-center py-2">
        <div class="flex items-center text-3xl">
            <font-awesome-icon :icon="['fas', icon]" class="mr-2" /> 
            <h2 class="font-nunit font-bold text-3xl mt-1">{{ page }}</h2>
        </div>
        <div class="flex justify-center items-center p-2 text-xl">
            <div class="mr-5 text-end">
                <h2 class="font-bold font-roboto text-md">{{ userNome }}</h2>
                <h2 class="font-roboto text-sm font-medium text-accent">{{ userCargo }}</h2>
            </div>
            <div class="dropdown dropdown-hover dropdown-end">
                <img tabindex="0" role="button" :src="getUserImage(userPic)" :alt="userNome+' | Imagem do artista'" class="h-16 w-16 rounded-full">
                <ul tabindex="0" class="dropdown-content z-[1] menu shadow p-0 bg-secondary rounded-md w-52">
                    <li><div class="cursor-pointer">
                        <font-awesome-icon :icon="['fas', 'user-gear']" /> Configurar perfil
                    </div></li>
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
            userPic: localStorage.getItem("userPic") || "",
            userNome: localStorage.getItem("userNome") || "",
            userCargo: localStorage.getItem("userCargo") || ""
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
                return "/user-placeholder.png";
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