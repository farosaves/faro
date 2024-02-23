declare namespace svelteHTML {
    interface HTMLProps<T> {
        'on:clickoutside'?: (event: any) => void;
        // If you want to use myCustomAttribute={..} (note: all lowercase)
        // You can replace any with something more specific if you like
    }
}
