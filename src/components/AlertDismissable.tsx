import React, { FC } from 'react';
import { Alert } from 'react-bootstrap';

type AlertProps = {
    heading: string;
    content: string;
    type: string;
    show: boolean;
    setShow: (isShow: boolean) => void;
}

const AlertDismissable: FC<AlertProps> = (props) => {
    const { heading, content, type, show, setShow } = props;

    if (show) {
        return (
            <Alert variant={type} onClose={() => setShow(false)} dismissible>
                <Alert.Heading>
                    {heading}
                </Alert.Heading>
                <p className="text-break">
                    {content}
                </p>
            </Alert>
        );
    }
    return null;
}

export default AlertDismissable;
