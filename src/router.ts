import { createRouter, createWebHashHistory } from 'vue-router';
import MainArea from "./MainArea.vue";
import { latest } from '@/versions/versions.ts';

export const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{
			path: '/',
			redirect: () => window.localStorage.getItem("version") ?? latest,
		},
		{
			path: '/:ver',
			component: MainArea,
			props: true,
		},
	],
});
