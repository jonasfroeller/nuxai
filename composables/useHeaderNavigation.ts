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

    // basically the same thing, just more complex:
    // const headerNavigationSize = useState('header-navigation-size', () => ref({ width: 0, height: 0 }));
    /* onMounted(() => {
        if (headerNavigation.value !== null) {
            const { width, height } = useElementSize(headerNavigation);
            headerNavigationSize.value = { width: width.value, height: height.value };

            watch(width, (newWidth) => {
                headerNavigationSize.value.width = newWidth;
            });

            watch(height, (newHeight) => {
                headerNavigationSize.value.height = newHeight;
            });
        }
    }); */

    return {
        headerNavigationElement: headerNavigation,
        headerNavigationSize,
    };
}
