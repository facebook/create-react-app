import * as React from "react";
import { FormattedMessage, IntlShape } from "react-intl";

export interface DefaultInjectedIntlProps
{
	intl: IntlShape;
}

export default function Message(
	id: string,
	defaultMessage?: string
)
{
	return (
		<FormattedMessage
			id={id}
			defaultMessage={defaultMessage ? defaultMessage : id}
		/>
	);
}
