function normalize(d) {
    // Decimal128 object
    return d.toString({ normalize: true });
}

export { normalize };
