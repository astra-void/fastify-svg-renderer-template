export type ExampleSvgProps = Readonly<{
	title: string;
	value: number;
	width: number;
	height: number;
}>;

export function ExampleSvg(props: ExampleSvgProps) {
	const { title, value, width, height } = props;

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
		>
			<rect x="0" y="0" width={width} height={height} rx="16" />
			<text x="20" y="44" font-size="20">
				{title}
			</text>
			<text x="20" y="88" font-size="40">
				{String(value)}
			</text>
		</svg>
	);
}
