import { useElementSize } from '@vueuse/core'

export function useHeaderNavigation() {
    const headerNavigation = useState('header-navigation', () => ref<HTMLElement | null>(null));
    const headerNavigationSize = computed(() => {
        if (headerNavigation.value) {
            const { width, height } = useElementSize(headerNavigation);
            return { width: width.value, height: height.value };
        }
        return { width: 0, height: 0 };
    });

    return {
        headerNavigationElement: headerNavigation,
        headerNavigationSize,
    };
}
