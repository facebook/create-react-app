import * as React from 'react';
import '../styles/icons/index.scss';

export interface IconProps
{
	className?: string;
	style?: React.CSSProperties;
	width?: number | string;
	height?: number | string;
	color?: 'green' | 'orange' | 'gray' | 'red';
}

const Icon = (_Icon: React.ReactType): React.StatelessComponent<IconProps> => (
	{ className, width, height, color, style }: IconProps
): React.ReactElement<IconProps> =>
{
	const element = <_Icon />;
	const props: any = {
		className: 'icon' + (className ? ` ${className}` : '')
	};
	if (width) props.width = typeof width === 'string' ? width : `${width}px`;
	if (height) props.height = typeof height === 'string' ? height : `${height}px`;
	if (color) props.className += ` ${color}`;
	if (style) props.style = { ...props.style, ...style };
	return React.cloneElement(element, {
		...element.props,
		...props
	});
};

export const IconAdd = Icon(require('../images/icons/ic-add.svg'));

export enum IconNames
{
}

export const renderIcon = (name: IconNames, width: string | number, height: string | number, className?: string) =>
{
	const RenderIcon = Icon(require(`../images/icons/${name}.svg`));
	return <RenderIcon className={className} width={width} height={height} />
}