import { useElementSize } from '@vueuse/core'

export function useHeaderNavigation() {
    const headerNavigation = useState('header-navigation', () => ref<HTMLElement | null>(null));
    const headerNavigationSize = computed(() => {
        if (headerNavigation.value) {
            const { width, height } = useElementSize(headerNavigation); // TODO: somehow figure out how to write this composable properly without `onMounted is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup(). If you are using async setup(), make sure to register lifecycle`
            return { width: width.value, height: height.value };
        }
        return { width: 0, height: 0 };
    });

    return {
        headerNavigationElement: headerNavigation,
        headerNavigationSize,
    };
}
