import { get } from '@aws-amplify/api';

export async function fetchCards() {
    const restOperation = get({ apiName: 'todoAPI', path: '/cards' })
    const { body } = await restOperation.response;
    const response = await body.json();
    return  response.data;
}