export const CardColors = {
    // Mapped directly from Flutter's Material Colors
    palette: [
        '#E040FB', // purpleAccent
        '#18FFFF', // cyanAccent
        '#69F0AE', // greenAccent
        '#FFAB40', // orangeAccent
        '#FF4081', // pinkAccent
        '#FFFF00', // yellowAccent
        '#536DFE', // indigoAccent
    ],

    /**
     * Retrieves a color from the palette, looping back to the start 
     * if the index exceeds the array length.
     */
    getColor(index: number): string {
        return this.palette[index % this.palette.length];
    }
};