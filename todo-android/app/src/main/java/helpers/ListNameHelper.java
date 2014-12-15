package helpers;


import java.util.Random;

import config.Config;

public class ListNameHelper {

    public static String generateRandomList() {
        Random rnd = new Random();
        StringBuilder sb = new StringBuilder( 6 );
        for( int i = 0; i < 6; i++ )
            sb.append( Config.RANDOM_STR_SET.charAt(rnd.nextInt(Config.RANDOM_STR_SET.length())) );
        return sb.toString();
    }
}
