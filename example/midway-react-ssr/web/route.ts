import { ReactESMFeRouteItem } from "tiger-types-react";

interface IFeRoutes extends Pick<ReactESMFeRouteItem, 'path' | 'preload' | 'exact' | 'meta'> {
    component: string
    fetch: boolean
    routes?: IFeRoutes[]
}

export const FeRoutes: IFeRoutes[] = [
    
    {
        path: '/',
        component: '@/components/layout/main',
        fetch: false,
        routes: [
            {
                path: '/',
                component: '@/pages/index',
                fetch: true
            },
            {
                path: '/detail/:id',
                component: '@/pages/detail',
                fetch: true,
                preload: true
            }
        ]
    },
];
