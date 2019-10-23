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

const Icon = (Icon: React.ReactType): React.StatelessComponent<IconProps> => (
    { className, width, height, color, style }: IconProps
): React.ReactElement<IconProps> =>
{
    const element = <Icon/>;
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

export const AddIcon = Icon(require('../images/icons/ic-add.svg'));
export const AreaIcon = Icon(require('../images/icons/ic-area.svg'));
export const CoordinateDisplayIcon = Icon(require('../images/icons/ic-coordinate-display.svg'));
export const CoordinateIcon = Icon(require('../images/icons/ic-coordinate.svg'));
export const DownloadIcon = Icon(require('../images/icons/ic-download.svg'));
export const ElevationIcon = Icon(require('../images/icons/ic-elevation.svg'));
export const EyeIcon = Icon(require('../images/icons/ic-eye.svg'));
export const ImportIcon = Icon(require('../images/icons/ic-import.svg'));
export const LineIcon = Icon(require('../images/icons/ic-line.svg'));
export const NoteIcon = Icon(require('../images/icons/ic-note.svg'));
export const ResetVisionIcon = Icon(require('../images/icons/ic-reset-the-vision.svg'));
export const RevokeIcon = Icon(require('../images/icons/ic-revoke.svg'));
export const SidebarIcon = Icon(require('../images/icons/ic-sidebar.svg'));
export const StoreIcon = Icon(require('../images/icons/ic-store.svg'));
export const SubtractIcon = Icon(require('../images/icons/ic-subtract.svg'));
export const TrashIcon = Icon(require('../images/icons/ic-trash.svg'));
export const UpIcon = Icon(require('../images/icons/ic-up.svg'));
export const VolumeIcon = Icon(require('../images/icons/ic-volume.svg'));

export enum IconNames
{
    ADD = "ADD",
    AREA = "AREA",
    COORDINATE_DISPLAY = "COORDINATE_DISPLAY",
    COORDINATE = "COORDINATE",
    DOWNLOAD = "DOWNLOAD",
    ELEVATION = "ELEVATION",
    EYE = "EYE",
    IMPORT = "IMPORT",
    LINE = "LINE",
    NOTE = "NOTE",
    RESET_VISION = "RESET_VISION",
    REVOKE = "REVOKE",
    SIDEBAR = "SIDEBAR",
    STORE = "STORE",
    SUBTRACT = "SUBTRACT",
    TRASH = "TRASH",
    UP = "UP",
    VOLUME = "VOLUME",
}

export const renderIcon = (name: IconNames, width: string, height: string, className?: string) =>
{
    switch (name)
    {
        case(IconNames.ADD):
            return <AddIcon className={className} width={width} height={height} />;
        case(IconNames.AREA):
            return <AreaIcon className={className} width={width} height={height} />;
        case(IconNames.COORDINATE_DISPLAY):
            return <CoordinateDisplayIcon className={className} width={width} height={height} />;
        case(IconNames.COORDINATE):
            return <CoordinateIcon className={className} width={width} height={height} />;
        case(IconNames.DOWNLOAD):
            return <DownloadIcon className={className} width={width} height={height} />;
        case(IconNames.ELEVATION):
            return <ElevationIcon className={className} width={width} height={height} />;
        case(IconNames.EYE):
            return <EyeIcon className={className} width={width} height={height} />;
        case(IconNames.IMPORT):
            return <ImportIcon className={className} width={width} height={height} />;
        case(IconNames.LINE):
            return <LineIcon className={className} width={width} height={height} />;
        case(IconNames.NOTE):
            return <NoteIcon className={className} width={width} height={height} />;
        case(IconNames.RESET_VISION):
            return <ResetVisionIcon className={className} width={width} height={height} />;
        case(IconNames.REVOKE):
            return <RevokeIcon className={className} width={width} height={height} />;
        case(IconNames.SIDEBAR):
            return <SidebarIcon className={className} width={width} height={height} />;
        case(IconNames.STORE):
            return <StoreIcon className={className} width={width} height={height} />;
        case(IconNames.SUBTRACT):
            return <SubtractIcon className={className} width={width} height={height} />;
        case(IconNames.TRASH):
            return <TrashIcon className={className} width={width} height={height} />;
        case(IconNames.UP):
            return <UpIcon className={className} width={width} height={height} />;
        case(IconNames.VOLUME):
            return <VolumeIcon className={className} width={width} height={height} />;
    }
}